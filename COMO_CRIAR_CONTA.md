# 🔐 Como Criar Conta no Eternize

## 📌 Você tem 3 opções:

### ✨ Opção 1: Usar SEM Cadastro (Recomendado)
**Mais rápido e simples!**

1. Abra `create.html`
2. Adicione fotos e informações
3. Gere o link e compartilhe
4. **Não precisa de login!**

---

### 👤 Opção 2: Criar Conta (Sistema Antigo)
**Para ter dashboard e gerenciar eventos**

1. Abra `register.html`
2. Preencha:
   - Nome completo
   - E-mail
   - Telefone (opcional)
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
3. Marque "Aceito os termos"
4. Clique em "Criar Conta"
5. Pronto! Você será redirecionado para o dashboard

---

### 🔑 Opção 3: Fazer Login (Se já tem conta)

1. Abra `login.html`
2. Digite seu e-mail e senha
3. Clique em "Entrar"
4. Acesse o dashboard

---

## 🐛 Problemas Comuns

### "Não consigo criar conta"
**Solução:**
- Verifique se preencheu todos os campos
- A senha deve ter no mínimo 6 caracteres
- As senhas devem ser iguais
- Marque a caixa "Aceito os termos"

### "E-mail já cadastrado"
**Solução:**
- Use outro e-mail
- Ou faça login com o e-mail existente
- Ou limpe os dados: Abra o Console (F12) e digite:
  ```javascript
  localStorage.clear()
  ```

### "Página não carrega"
**Solução:**
- Verifique se está abrindo os arquivos HTML no navegador
- Teste em outro navegador (Chrome, Firefox, Edge)
- Limpe o cache do navegador

---

## 🎯 Qual opção escolher?

### Use SEM Cadastro se:
- ✅ Quer testar rapidamente
- ✅ Não quer criar conta
- ✅ Vai usar apenas uma vez
- ✅ Quer simplicidade

### Crie Conta se:
- ✅ Quer salvar múltiplos eventos
- ✅ Quer dashboard completo
- ✅ Quer gerenciar tudo em um lugar
- ✅ Vai usar frequentemente

---

## 📱 Passo a Passo Visual

### Para Criar Conta:

```
1. Abra register.html
   ↓
2. Preencha o formulário
   ↓
3. Clique em "Criar Conta"
   ↓
4. Aguarde confirmação
   ↓
5. Será redirecionado para dashboard.html
   ↓
6. Pronto! Conta criada ✅
```

### Para Usar Sem Conta:

```
1. Abra create.html
   ↓
2. Adicione fotos
   ↓
3. Clique em "Finalizar"
   ↓
4. Copie o link gerado
   ↓
5. Compartilhe!
   ↓
6. Pronto! ✅
```

---

## 🔧 Dados Salvos

### Sistema COM Conta:
- Dados salvos em: `localStorage.eternize_user`
- Eventos salvos em: `localStorage.eternize_events`
- Fotos salvas em: `IndexedDB.EternizeDB`

### Sistema SEM Conta:
- Fotos salvas em: `IndexedDB.EternizeDB`
- Dados da página em: `IndexedDB.EternizeDB.pages`

---

## 🆘 Precisa de Ajuda?

### Limpar todos os dados:
```javascript
// Abra o Console (F12) e cole:
localStorage.clear();
indexedDB.deleteDatabase('EternizeDB');
location.reload();
```

### Ver dados salvos:
```javascript
// Abra o Console (F12) e cole:
console.log('Usuário:', localStorage.getItem('eternize_user'));
console.log('Eventos:', localStorage.getItem('eternize_events'));
```

---

## ✅ Resumo

| Recurso | Sem Conta | Com Conta |
|---------|-----------|-----------|
| Criar páginas | ✅ | ✅ |
| Upload de fotos | ✅ | ✅ |
| Gerar QR Code | ✅ | ✅ |
| Dashboard | ❌ | ✅ |
| Salvar eventos | ❌ | ✅ |
| Gerenciar múltiplos | ❌ | ✅ |

---

## 🚀 Comece Agora!

**Opção Rápida (Sem Conta):**
- Abra: `create.html`

**Opção Completa (Com Conta):**
- Abra: `register.html`

**Já tem conta?**
- Abra: `login.html`

---

**✨ Pronto para eternizar seus momentos!**
