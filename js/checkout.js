// Get plan from URL
const urlParams = new URLSearchParams(window.location.search);
const selectedPlan = urlParams.get('plan') || 'premium';

// Plan data
const plans = {
    basico: {
        name: 'Básico',
        description: 'Perfeito para eventos pequenos',
        price: 97,
        features: [
            '✓ Até 100 fotos',
            '✓ 1 evento ativo',
            '✓ QR Code personalizado',
            '✓ Armazenamento por 30 dias',
            '✓ Download em alta resolução',
            '✓ Suporte por email'
        ]
    },
    premium: {
        name: 'Premium',
        description: 'Ideal para casamentos e festas',
        price: 197,
        features: [
            '✓ Fotos ilimitadas',
            '✓ Até 3 eventos ativos',
            '✓ QR Code + Link personalizado',
            '✓ Armazenamento por 1 ano',
            '✓ Download ilimitado',
            '✓ Mensagens dos convidados',
            '✓ Personalização completa',
            '✓ Suporte prioritário'
        ]
    },
    profissional: {
        name: 'Profissional',
        description: 'Para fotógrafos e empresas',
        price: 397,
        features: [
            '✓ Tudo do Premium',
            '✓ Eventos ilimitados',
            '✓ Marca branca (seu logo)',
            '✓ Armazenamento ilimitado',
            '✓ API de integração',
            '✓ Relatórios avançados',
            '✓ Múltiplos usuários',
            '✓ Suporte VIP 24/7'
        ]
    }
};

// Update summary with selected plan
function updateSummary() {
    const plan = plans[selectedPlan];
    
    document.querySelector('.plan-badge-small').textContent = plan.name;
    document.querySelector('.plan-selected h4').textContent = `Plano ${plan.name}`;
    document.querySelector('.plan-selected p').textContent = plan.description;
    
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = plan.features.map(f => `<li>${f}</li>`).join('');
    
    document.getElementById('subtotal').textContent = `R$ ${plan.price.toFixed(2).replace('.', ',')}`;
    document.getElementById('total').textContent = `R$ ${plan.price.toFixed(2).replace('.', ',')}`;
}

// Initialize
updateSummary();

// Step navigation
function nextStep(step) {
    // Validate current step
    if (step === 2) {
        const form = document.getElementById('checkoutForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    
    // Update steps
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active');
        if (parseInt(s.dataset.step) < step) {
            s.classList.add('completed');
        }
    });
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.step-content').forEach(c => {
        c.classList.remove('active');
    });
    document.querySelector(`.step-content[data-step="${step}"]`).classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(step) {
    nextStep(step);
}

// Payment method selection
document.querySelectorAll('.payment-method input').forEach(input => {
    input.addEventListener('change', function() {
        // Update active state
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('active');
        });
        this.closest('.payment-method').classList.add('active');
        
        // Show corresponding form
        document.querySelectorAll('.payment-form').forEach(f => {
            f.classList.remove('active');
        });
        
        const method = this.id;
        if (method === 'credit') {
            document.getElementById('creditCardForm').classList.add('active');
        } else if (method === 'pix') {
            document.getElementById('pixForm').classList.add('active');
        } else if (method === 'boleto') {
            document.getElementById('boletoForm').classList.add('active');
        }
    });
});

// Process payment
function processPayment() {
    const paymentMethod = document.querySelector('.payment-method.active input').id;
    
    // Show loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Processando...';
    btn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // Save to localStorage
        const userData = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            plan: selectedPlan,
            paymentMethod: paymentMethod,
            purchaseDate: new Date().toISOString()
        };
        
        localStorage.setItem('eternize_user', JSON.stringify(userData));
        
        // Go to success step
        nextStep(3);
        
        btn.textContent = originalText;
        btn.disabled = false;
    }, 2000);
}

// Apply coupon
function applyCoupon() {
    const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();
    const plan = plans[selectedPlan];
    
    const coupons = {
        'ETERNIZE10': 0.10,
        'PRIMEIRACOMPRA': 0.15,
        'BLACKFRIDAY': 0.30
    };
    
    if (coupons[couponCode]) {
        const discount = plan.price * coupons[couponCode];
        const total = plan.price - discount;
        
        document.getElementById('discount').textContent = `-R$ ${discount.toFixed(2).replace('.', ',')}`;
        document.getElementById('total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        // Show success message
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Aplicado';
        btn.style.background = 'var(--verde-menta)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    } else {
        alert('Cupom inválido');
    }
}

// Input masks
document.getElementById('telefone')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    e.target.value = value;
});

document.getElementById('cpf')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
});

document.getElementById('cardNumber')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
});

document.getElementById('cardExpiry')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
});

document.getElementById('cardCvv')?.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
});
