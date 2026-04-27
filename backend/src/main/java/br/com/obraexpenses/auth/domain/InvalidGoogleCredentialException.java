package br.com.obraexpenses.auth.domain;

public class InvalidGoogleCredentialException extends RuntimeException {

    public InvalidGoogleCredentialException(String message) {
        super(message);
    }
}
