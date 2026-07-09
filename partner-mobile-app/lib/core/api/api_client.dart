import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_controller.dart';
import '../auth/session_store.dart';
import '../config/app_config.dart';

final dioProvider = Provider<Dio>((ref) {
  final store = ref.watch(sessionStoreProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.partnerApiUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 20),
      headers: {'Accept': 'application/json'},
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await store.readToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        final refreshToken = await store.readRefreshToken();
        // Guard against retrying the same request more than once: if the retried
        // request still comes back 401 (e.g. the resource itself requires
        // different auth, not just an expired token), fall through instead of
        // refreshing again in an unbounded loop.
        final alreadyRetriedAfterRefresh =
            error.requestOptions.extra['retriedAfterRefresh'] == true;
        final canRefresh =
            error.response?.statusCode == 401 &&
            !alreadyRetriedAfterRefresh &&
            refreshToken != null &&
            refreshToken.isNotEmpty &&
            error.requestOptions.path != '/auth/refresh';
        if (!canRefresh) return handler.next(error);

        try {
          final refreshDio = Dio(BaseOptions(baseUrl: AppConfig.partnerApiUrl));
          final refreshResponse = await refreshDio.post(
            '/auth/refresh',
            data: {'refreshToken': refreshToken},
          );
          final data = Map<String, dynamic>.from(
            refreshResponse.data['data'] as Map,
          );
          await store.save(
            token: data['token'] as String,
            refreshToken: data['refreshToken'] as String,
            role: data['role'] as String,
          );
          final retry = await dio.fetch(
            error.requestOptions
              ..extra['retriedAfterRefresh'] = true
              ..headers['Authorization'] = 'Bearer ${data['token']}',
          );
          return handler.resolve(retry);
        } catch (_) {
          // Refresh failed (expired/invalid refresh token, or the backend is
          // unreachable) - log the user out so the router redirects to /login
          // immediately, instead of leaving them on a protected screen with no
          // valid token.
          await ref.read(authControllerProvider.notifier).logout();
          return handler.next(error);
        }
      },
    ),
  );

  return dio;
});

class ApiEnvelope<T> {
  const ApiEnvelope({required this.ok, required this.data, this.message});
  final bool ok;
  final T? data;
  final String? message;
}

String apiErrorMessage(Object error) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] != null) return data['message'].toString();

    switch (error.response?.statusCode) {
      case 400:
        return 'الطلب غير صحيح. تحقق من البيانات وحاول مرة أخرى.';
      case 401:
        return 'انتهت الجلسة. يرجى تسجيل الدخول مجددًا.';
      case 403:
        return 'لا تملك صلاحية تنفيذ هذا الإجراء.';
      case 404:
        return 'العنصر المطلوب غير موجود.';
      case 422:
        return 'بعض البيانات غير مكتملة أو غير صحيحة.';
      case 429:
        return 'تم إرسال طلبات كثيرة. حاول لاحقًا.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'الخدمة غير متاحة حاليًا. حاول لاحقًا.';
    }

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      return 'انتهت مهلة الاتصال. تحقق من الشبكة وحاول مرة أخرى.';
    }

    if (error.type == DioExceptionType.connectionError) {
      return 'تعذر الاتصال بالخادم. تحقق من الشبكة.';
    }
  }

  return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
}
