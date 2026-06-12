const errorMap: Record<string, string> = {
    'Email already registered': 'Este e-mail já está cadastrado.',
    'Invalid credentials': 'E-mail ou senha incorretos.',
    'Please verify your email before logging in': 'Você precisa verificar seu e-mail antes de entrar.',
    'Invalid or expired verification token': 'Link de verificação inválido ou expirado.',
    'Verification token has expired': 'O link de verificação expirou. Solicite um novo cadastro.',
    'A new verification email has been sent. Check your inbox.': 'Um novo e-mail de verificação foi enviado.',
    'Client not found': 'Cliente não encontrado.',
    'Email already in use': 'Este e-mail já está em uso por outro cliente ativo.',
    'Email is already in use': 'Este e-mail já está em uso por outro usuário.',
    'Current password is incorrect': 'A senha atual fornecida está incorreta.',

    'Invalid email address': 'Endereço de e-mail inválido ou inexistente.',
    'Password must contain at least one letter and one number': 'A senha deve conter pelo menos uma letra e um número.',
    'Name is required': 'O nome é obrigatório.',
    'Email is required': 'O e-mail é obrigatório.',
    'Name must be between 2 and 100 characters': 'O nome deve ter entre 2 e 100 caracteres.',
    'Password must be at least 8 characters': 'A senha deve ter no mínimo 8 caracteres.',
    'Invalid email format': 'Formato de e-mail inválido.',
    'Password is required': 'A senha é obrigatória.',
}

export const translateError = (message: string): string => {
    if (errorMap[message]) {
        return errorMap[message]
    }

    for (const [key, value] of Object.entries(errorMap)) {
        if (message.toLowerCase().includes(key.toLowerCase())) {
            return value
        }
    }

    return 'Ocorreu um erro inesperado. Tente novamente.'
}
