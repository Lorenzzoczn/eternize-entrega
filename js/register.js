// Handle register form
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const btn = e.target.querySelector('button[type="submit"]');
    
    // Validações
    if (!name || !email || !password) {
        alert('❌ Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    if (password.length < 6) {
        alert('❌ A senha deve ter no mínimo 6 caracteres');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('❌ As senhas não coincidem');
        return;
    }
    
    if (!terms) {
        alert('❌ Você precisa aceitar os termos de uso');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Por favor, insira um e-mail válido');
        return;
    }
    
    // Verificar se email já existe
    const existingUser = JSON.parse(localStorage.getItem('eternize_user'));
    if (existingUser && existingUser.email === email) {
        alert('❌ Este e-mail já está cadastrado. Faça login ou use outro e-mail.');
        return;
    }
    
    // Mostrar loading
    btn.disabled = true;
    btn.textContent = 'Criando conta...';
    
    // Simular delay de criação
    setTimeout(() => {
        // Criar novo usuário
        const newUser = {
            nome: name,
            email: email,
            telefone: phone || '(31) 99999-9999',
            plan: 'premium',
            purchaseDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            events: []
        };
        
        // Salvar no localStorage
        localStorage.setItem('eternize_user', JSON.stringify(newUser));
        
        console.log('✅ Conta criada com sucesso:', newUser);
        
        // Mostrar mensagem de sucesso
        alert('✅ Conta criada com sucesso! Bem-vindo ao Eternize!');
        
        // Redirecionar para dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
        
    }, 1000);
});

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('eternize_user'));
    if (userData) {
        console.log('Usuário já logado, redirecionando...');
        if (confirm('Você já está logado. Deseja ir para o dashboard?')) {
            window.location.href = 'dashboard.html';
        }
    }
});

// Máscara de telefone
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    
    if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1');
    }
    
    e.target.value = value;
});
