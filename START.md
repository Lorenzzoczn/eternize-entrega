# 🚀 Início Rápido - Sistema Eternize Completo

## ⚡ Setup em 3 Minutos

### 1. Instalar

```bash
cd eternize-checkout
npm install
```

### 2. Configurar S3

```bash
cd server
cp .env.example .env
# Edite .env com suas credenciais S3
```

**Não tem S3?** Use modo offline (IndexedDB) - funciona sem configurar nada!

### 3. Rodar

```bash
npm run dev:all
```

Isso inicia:
- ✅ Backend em `http://localhost:3000`
- ✅ Frontend em `http://localhost:5500`

### 4. Testar

Abra: `http://localhost:5500`

---

## 🎯 Comandos Disponíveis

```bash
# Rodar tudo junto
npm run dev:all

# Apenas backend
npm run server

# Apenas frontend
npm run frontend

# Produção
npm start
```

---

## 📋 Checklist Rápido

- [ ] `npm install` executado
- [ ] S3 configurado (ou usar modo offline)
- [ ] Backend rodando (porta 3000)
- [ ] Frontend rodando (porta 5500)
- [ ] Navegador aberto em localhost:5500

---

## 🐛 Problemas?

### Porta 3000 ocupada
```bash
PORT=3001 npm run server
```

### Sem S3 configurado
O sistema funciona em modo offline automaticamente!

### CORS Error
Certifique-se que backend está rodando.

---

## 📚 Documentação Completa

- **Sistema Completo:** [SISTEMA_COMPLETO.md](SISTEMA_COMPLETO.md)
- **Configurar S3:** `../eternize-backend/CONFIGURAR_S3.md`
- **Deploy:** [DEPLOY_NETLIFY.md](DEPLOY_NETLIFY.md)

---

## ✨ Pronto!

Acesse: `http://localhost:5500` e comece a usar!
