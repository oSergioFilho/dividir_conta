# dividir_conta 🧾

App de divisão de contas de restaurante com sistema granular de divisão por item.

## ✨ Funcionalidades

- ✅ **Adicionar pessoas** para dividir a conta
- ✅ **Adicionar itens** individualmente com preço unitário e quantidade
- ✅ **Divisão granular**: cada unidade de item pode ser dividida entre pessoas diferentes
- ✅ **Taxa de serviço** configurável
- ✅ **Scanner OCR** para fotos de conta (ready para integração)
- ✅ **Cálculo automático** com frações (ex: "Coca Cola 1/4")
- ✅ **Interface responsiva** e mobile-first

## 🚀 Como usar

### Instalação

```

### Desenvolvimento

```bash
npm run dev
```

### Build para produção

```bash
npm run build
```

## 💡 Como funciona

### Sistema de Divisão Granular

O diferencial deste app é que você não multiplica quantidades automaticamente. Em vez disso:

1. **Adicione itens individualmente**: COCA COLA - R$ 10,90 (quantidade: 4)
2. **Isso cria 4 unidades separadas**, cada uma pode ser dividida diferentemente
3. **Divida cada unidade**: 
   - Unidade 1: dividir entre João e Maria (1/2 cada)
   - Unidade 2: dividir entre Pedro, Ana, João e Maria (1/4 cada)
   - Unidade 3: só para Pedro (1/1)
   - Unidade 4: dividir entre Ana e João (1/2 cada)

### Exemplo Prático

**FILE DJON x2 - R$ 82,90**
- Unidade 1: Pessoa A come sozinha (1/1 = R$ 82,90)
- Unidade 2: Pessoas B e C dividem (1/2 cada = R$ 41,45 cada)

No resumo aparece:
- Pessoa A: FILE DJON (1/1) - R$ 82,90
- Pessoa B: FILE DJON (1/2) - R$ 41,45
- Pessoa C: FILE DJON (1/2) - R$ 41,45

## 🛠️ Tecnologias

- **React 19** com TypeScript
- **Vite** (build ultra-rápido)
- **Tailwind CSS** (estilização)
- **OCR Ready** (preparado para Tesseract.js ou Google Vision API)

## 📱 Interface

- Design mobile-first
- Cores distintas para cada pessoa
- Visualização clara das divisões
- Resumo detalhado por pessoa

## 🔮 Próximos Passos

- [ ] Integrar OCR real (Tesseract.js)
- [ ] Persistência local (LocalStorage)
- [ ] Exportar resumo (PDF/Imagem)
- [ ] Histórico de contas
- [ ] Compartilhar via link
- [ ] PWA (instalar como app)

## 📄 Licença

MIT
