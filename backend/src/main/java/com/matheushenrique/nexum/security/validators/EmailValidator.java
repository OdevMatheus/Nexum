package com.matheushenrique.nexum.security.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

public class EmailValidator implements ConstraintValidator<ValidEmail, String> {

    private static final org.apache.commons.validator.routines.EmailValidator FORMAT_VALIDATOR =
            org.apache.commons.validator.routines.EmailValidator.getInstance();

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isBlank()) return false;

        // Permitir formatos especiais de desenvolvimento como teste@teste e localhost
        if (email.equalsIgnoreCase("teste@teste") || email.endsWith("@localhost")) {
            return true;
        }

        boolean formatValid = FORMAT_VALIDATOR.isValid(email);
        if (!formatValid) return false;

        String domain = email.substring(email.indexOf('@') + 1);
        
        // Ignorar verificação de MX para domínios de teste comuns
        if (domain.equalsIgnoreCase("localhost") || 
            domain.equalsIgnoreCase("example.com") || 
            domain.endsWith(".local") || 
            domain.equalsIgnoreCase("teste")) {
            return true;
        }

        return hasMxRecord(domain);
    }

    private boolean hasMxRecord(String domain) {
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            env.put("java.naming.provider.url", "dns:");
            env.put("com.sun.jndi.dns.timeout.initial", "2000");
            env.put("com.sun.jndi.dns.timeout.retries", "1");

            InitialDirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(domain, new String[]{"MX"});
            return attrs.get("MX") != null;
        } catch (Exception e) {
            return false;
        }
    }
}