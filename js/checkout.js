// Get params from URL (fallback para plano premium único)
const urlParams = new URLSearchParams(window.location.search);
const selectedPlan = urlParams.get('plan') || 'premium';
const clientIdFromUrl = urlParams.get('clientId') || null;
const returnUrlFromUrl = urlParams.get('returnUrl')
    ? decodeURIComponent(urlParams.get('returnUrl'))
    : null;

// API base (localhost vs produção)
const apiBaseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// Plan data (preço premium ajustado para 497,99)
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
        price: 497.99,
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

// Atualiza o resumo com o plano selecionado
function updateSummary() {
    const plan = plans[selectedPlan] || plans.premium;
    
    document.querySelector('.plan-badge-small').textContent = plan.name;
    document.querySelector('.plan-selected h4').textContent = `Plano ${plan.name}`;
    document.querySelector('.plan-selected p').textContent = plan.description;
    
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = plan.features.map(f => `<li>${f}</li>`).join('');
    
    const priceText = `R$ ${plan.price.toFixed(2).replace('.', ',')}`;
    document.getElementById('subtotal').textContent = priceText;
    document.getElementById('total').textContent = priceText;
}

// Inicializar resumo ao carregar a página
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

// Exibir pagamento PIX (caso o backend passe dados de QR/código)
function showPixDetails(pixData) {
    const pixForm = document.getElementById('pixForm');
    if (!pixForm) return;

    // Forçar seleção do método PIX visualmente
    const pixRadio = document.getElementById('pix');
    if (pixRadio) {
        pixRadio.checked = true;
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
        pixRadio.closest('.payment-method')?.classList.add('active');
    }

    // Container para QRCode
    let qrContainer = document.getElementById('pixQrCodeContainer');
    if (!qrContainer) {
        qrContainer = document.createElement('div');
        qrContainer.id = 'pixQrCodeContainer';
        qrContainer.style.marginTop = '20px';
        qrContainer.style.display = 'flex';
        qrContainer.style.justifyContent = 'center';
        pixForm.appendChild(qrContainer);
    } else {
        qrContainer.innerHTML = '';
    }

    // Campo copia-e-cola
    let copyField = document.getElementById('pixCopyCode');
    if (!copyField) {
        copyField = document.createElement('textarea');
        copyField.id = 'pixCopyCode';
        copyField.readOnly = true;
        copyField.style.width = '100%';
        copyField.style.marginTop = '15px';
        copyField.style.padding = '10px';
        pixForm.appendChild(copyField);
    }

    const payload = pixData.payload || pixData.code || pixData.qrCode || '';
    copyField.value = payload;

    if (window.QRCode && payload) {
        new QRCode(qrContainer, {
            text: payload,
            width: 200,
            height: 200
        });
    }
}

// Processar pagamento chamando o backend Asaas
async function processPayment(event) {
    const paymentMethod = document.querySelector('.payment-method.active input').id;

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Processando...';
    btn.disabled = true;

    try {
        const plan = plans[selectedPlan] || plans.premium;

        const body = {
            planId: selectedPlan,
            planName: `Plano ${plan.name}`,
            description: plan.description,
            // valor fixo do checkout: 497,99
            value: 497.99,
            clientId: clientIdFromUrl || document.getElementById('email').value,
            customerName: document.getElementById('nome').value,
            customerEmail: document.getElementById('email').value,
            customerCpfCnpj: document.getElementById('cpf').value,
            // força cobrança Asaas como PIX (backend pode usar se aplicável)
            billingType: 'PIX',
            paymentMethod,
            returnUrl: returnUrlFromUrl || null
        };

        const response = await fetch(`${apiBaseUrl}/payments/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Resposta /api/payments/create:', data);

        if (!response.ok || !data.success) {
            const msg = data && data.error ? data.error : 'Erro ao criar pagamento. Tente novamente.';
            alert(msg);
        } else if (data.checkoutUrl) {
            // Redireciona para o checkout do Asaas (inclui PIX/QR dentro do Asaas)
            window.location.href = data.checkoutUrl;
            return;
        } else if (data.payment && data.payment.checkoutUrl) {
            window.location.href = data.payment.checkoutUrl;
            return;
        } else if (data.pix || data.qrCode || data.payload) {
            // Suporte opcional caso backend retorne dados de PIX diretamente
            showPixDetails(data.pix || data);
        } else {
            alert('Pagamento criado, mas não foi retornado um link de checkout válido.');
        }
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        alert('Falha ao processar o pagamento. Tente novamente em alguns instantes.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
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
