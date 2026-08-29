package com.aphasia.app.model.dto;

public record ChangePasswordRequest(String oldPassword, String newPassword) {}
