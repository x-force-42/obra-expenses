package br.com.obraexpenses.auth.domain;

public interface GoogleTokenVerifier {

    GoogleUserInfo verify(String credential);
}
