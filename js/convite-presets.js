// ===== CONVITE PRESETS =====
// 10 presets diferentes de layout para convites com QR Code

const ConvitePresets = {
    // Preset 1: Minimalista Elegante
    preset1: {
        name: 'Minimalista Elegante',
        icon: '✨',
        generate: (data) => `
            <div class="convite-header-content">
                <h1 class="convite-title">${data.nome}</h1>
                <p class="convite-date">${data.data}</p>
                <p class="convite-message">${data.mensagem}</p>
            </div>
            <div class="convite-qr-section">
                <div class="qr-container">
                    <div id="qrcode"></div>
                </div>
                <p class="qr-instruction">Escaneie para compartilhar fotos</p>
            </div>
        `
    },

    // Preset 2: Casamento Clássico
    preset2: {
        name: 'Casamento Clássico',
        icon: '💍',
        generate: (data) => `
            <div class="convite-header-content">
                <div class="convite-icon">💍</div>
                <h1 class="convite-title">${data.nome}</h1>
                <p class="convite-date">${data.data}</p>
            </div>
            <p class="convite-message">${data.mensagem}</p>
            <div class="convite-qr-section">
                <div class="qr-container">
                    <div id="qrcode"></div>
                </div>
                <p class="qr-instruction">Compartilhe suas fotos conosco</p>
            </div>
        `
    },

    // Preset 3: Moderno Clean
    preset3: {
        name: 'Moderno Clean',
        icon: '🎯',
        generate: (data) => `
            <div class="convite-left">
                <h1 class="convite-title">${data.nome}</h1>
                <p class="convite-date">${data.data}</p>
                <p class="convite-message">${data.mensagem}</p>
            </div>
            <div class="convite-right">
                <div class="qr-container">
                    <div id="qrcode"></div>
                </div>
                <p class="qr-instruction">Escaneie aqui</p>
            </div>
        `
    },

    // Preset 4: Romântico Floral
    preset4: {
        name: 'Romântico Floral',
        icon: '🌸',
        generate: (data) => `
            <div class="convite-header-content">
                <h1 class="convite-title">${data.nome}</h1>
                <p class="convite-date">${data.data}</p>
            </div>
            <p class="convite-message">${data.mensagem}</p>
            <div class="convite-qr-section" style="text-align: center; margin-top: 40px;">
                <div class="qr-container" style="display: inline-block; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div id="qrcode"></div>
                </div>
                <p class="qr-instruction" style="margin-top: 15px; color: #666;">Compartilhe momentos especiais</p>
            </div>
        `
    },

    // Preset 5: Estilo Polaroid
    preset5: {
        name: 'Estilo Polaroid',
        icon: '📸',
        generate: (data) => `
            <div class="polaroid-frame">
                ${data.foto ? `<img src="${data.foto}" class="convite-photo" alt="Foto do evento">` : '<div class="convite-photo" style="background: linear-gradient(135deg, #E4D9B6 0%, #FFD1DC 100%);"></div>'}
                <h2 class="convite-title" style="font-size: 1.8rem; color: #333; margin-bottom: 10px;">${data.nome}</h2>
                <p class="convite-date" style="color: #666; margin-bottom: 15px;">${data.data}</p>
                <p class="convite-message" style="font-size: 0.9rem; color: #555; margin-bottom: 20px;">${data.mensagem}</p>
                <div style="text-align: center;">
                    <div class="qr-container" style="display: inline-block; background: #f5f5f5; padding: 15px; border-radius: 10px;">
                        <div id="qrcode"></div>
                    </div>
                </div>
            </div>
        `
    },

    // Preset 6: Estilo Festa
    preset6: {
        name: 'Estilo Festa',
        icon: '🎉',
        generate: (data) => `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🎉</div>
                <h1 class="convite-title" style="font-size: 2.5rem; color: white; margin-bottom: 15px;">${data.nome}</h1>
                <p class="convite-date" style="font-size: 1.3rem; color: rgba(255,255,255,0.9); margin-bottom: 25px;">${data.data}</p>
                <p class="convite-message" style="color: rgba(255,255,255,0.85); line-height: 1.8; margin-bottom: 40px;">${data.mensagem}</p>
                <div class="qr-container" style="display: inline-block; background: white; padding: 25px; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.3);">
                    <div id="qrcode"></div>
                </div>
                <p class="qr-instruction" style="margin-top: 20px; font-size: 1.1rem; font-weight: 600;">Compartilhe a diversão!</p>
            </div>
        `
    },

    // Preset 7: Minimal Dark
    preset7: {
        name: 'Minimal Dark',
        icon: '🌙',
        generate: (data) => `
            <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                    <h1 class="convite-title">${data.nome}</h1>
                    <p class="convite-date" style="color: rgba(255,255,255,0.7); font-size: 1.2rem; margin-bottom: 30px;">${data.data}</p>
                    <p class="convite-message" style="color: rgba(255,255,255,0.6); line-height: 1.8;">${data.mensagem}</p>
                </div>
                <div style="text-align: center;">
                    <div class="qr-container" style="display: inline-block; background: white; padding: 20px; border-radius: 15px;">
                        <div id="qrcode"></div>
                    </div>
                    <p class="qr-instruction" style="margin-top: 15px; color: rgba(255,255,255,0.8);">Escaneie para participar</p>
                </div>
            </div>
        `
    },

    // Preset 8: Estilo Vintage
    preset8: {
        name: 'Estilo Vintage',
        icon: '📜',
        generate: (data) => `
            <div style="text-align: center; position: relative; z-index: 1;">
                <div style="font-size: 2.5rem; margin-bottom: 20px;">📜</div>
                <h1 class="convite-title" style="font-family: 'Playfair Display', serif; font-size: 2.3rem; color: #5a4a3a; margin-bottom: 15px;">${data.nome}</h1>
                <p class="convite-date" style="color: #6b5b4b; font-size: 1.1rem; margin-bottom: 25px; font-style: italic;">${data.data}</p>
                <p class="convite-message" style="color: #5a4a3a; line-height: 1.8; margin-bottom: 35px; padding: 0 20px;">${data.mensagem}</p>
                <div class="qr-container" style="display: inline-block; background: white; padding: 20px; border-radius: 10px; border: 3px solid #8b7355;">
                    <div id="qrcode"></div>
                </div>
                <p class="qr-instruction" style="margin-top: 15px; color: #6b5b4b; font-style: italic;">Compartilhe suas memórias</p>
            </div>
        `
    },

    // Preset 9: Elegante Premium
    preset9: {
        name: 'Elegante Premium',
        icon: '👑',
        generate: (data) => `
            <div style="text-align: center;">
                <h1 class="convite-title">${data.nome}</h1>
                <p class="convite-date" style="color: rgba(255,255,255,0.8); font-size: 1.2rem; margin-bottom: 30px; letter-spacing: 2px;">${data.data}</p>
                <div style="width: 60px; height: 2px; background: var(--cor-principal, #E4D9B6); margin: 30px auto;"></div>
                <p class="convite-message" style="color: rgba(255,255,255,0.7); line-height: 1.8; margin-bottom: 40px; padding: 0 30px;">${data.mensagem}</p>
                <div class="qr-container" style="display: inline-block; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                    <div id="qrcode"></div>
                </div>
                <p class="qr-instruction" style="margin-top: 20px; color: rgba(255,255,255,0.8); font-weight: 600; letter-spacing: 1px;">COMPARTILHE CONOSCO</p>
            </div>
        `
    },

    // Preset 10: Criativo com Moldura
    preset10: {
        name: 'Criativo com Moldura',
        icon: '🎨',
        generate: (data) => `
            <div class="creative-frame">
                <div>
                    <h1 class="convite-title" style="font-size: 2.3rem; color: #333; margin-bottom: 15px; text-align: center;">${data.nome}</h1>
                    <p class="convite-date" style="text-align: center; color: #666; font-size: 1.1rem; margin-bottom: 25px;">${data.data}</p>
                    <p class="convite-message" style="color: #555; line-height: 1.8; text-align: center; padding: 0 20px;">${data.mensagem}</p>
                </div>
                <div style="text-align: center;">
                    <div class="qr-container" style="display: inline-block; background: var(--cor-secundaria, #FFD1DC); padding: 20px; border-radius: 15px;">
                        <div id="qrcode"></div>
                    </div>
                    <p class="qr-instruction" style="margin-top: 15px; color: #666; font-weight: 600;">Escaneie e participe!</p>
                </div>
            </div>
        `
    }
};

// Função para obter preset por número
function getPreset(presetNumber) {
    return ConvitePresets[`preset${presetNumber}`];
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ConvitePresets = ConvitePresets;
    window.getPreset = getPreset;
}
