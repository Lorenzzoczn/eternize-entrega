// Handle login form
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button[type="submit"]');
    
    // Validação básica
    if (!email || !password) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    // Mostrar loading
    btn.disabled = true;
    btn.textContent = 'Entrando...';
    
    // Simular delay de login
    setTimeout(() => {
        // Check if user exists
        const userData = JSON.parse(localStorage.getItem('eternize_user'));
        
        if (userData && userData.email === email) {
            // Login com usuário existente
            console.log('Login com usuário existente:', email);
            window.location.href = 'dashboard.html';
        } else {
            // Para demo, criar usuário automaticamente
            const newUser = {
                nome: email.split('@')[0], // Usar parte do email como nome
                email: email,
                telefone: '(31) 99999-9999',
                plan: 'premium',
                purchaseDate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('eternize_user', JSON.stringify(newUser));
            console.log('Novo usuário criado:', newUser);
            
            // Mostrar mensagem de sucesso
            alert('✅ Conta criada com sucesso! Redirecionando...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        }
    }, 1000);
});

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('eternize_user'));
    if (userData) {
        console.log('Usuário já logado, redirecionando...');
        window.location.href = 'dashboard.html';
    }
});
