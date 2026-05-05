package com.example.gitsocial.services;

import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.CompletableFuture;

public interface CloudinaryService {

    CompletableFuture<String> uploadImageAsync(MultipartFile file);
}
