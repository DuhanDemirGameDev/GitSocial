package com.example.gitsocial.services;

import com.example.gitsocial.domain.dto.*;

public interface AuthService {
    UserDto register(RegisterRequest request);

    AuthSessionResponse login(LoginRequest request);

    RefreshTokenResponse refresh(String refreshToken);

    LogoutResponse logout(String refreshToken);

    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
