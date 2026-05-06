package com.example.gitsocial.services;

public interface EmailService {
    void sendPasswordResetEmail(String to, String resetLink);
}