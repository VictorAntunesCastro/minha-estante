# 📚 Minha Estante

Uma estante virtual interativa e aconchegante para organizar leituras, lista de desejos, metas anuais e estatísticas literárias.

## ✨ Funcionalidades

- **🏛️ Estante Interativa em 3D:** Os livros ficam organizados pela lombada na prateleira de madeira e, ao passar o mouse, giram em 3D revelando a capa frontal.
- **🗂️ Coleções Personalizadas:** Crie estantes temáticas (*Principal*, *Fantasia*, *Romances*, *Emprestados*) e organize seus livros.
- **🇧🇷 Busca Automática em Português:** Integração com **Apple Books Brasil**, **Google Books BR** e **OpenLibrary** trazendo títulos, gêneros, número de páginas e capas das edições brasileiras em alta resolução.
- **📖 Progresso de Leitura ("Lendo Agora"):** Acompanhe a página atual, total de páginas e porcentagem concluída dos livros em andamento, com fitinha marcadora de página na estante.
- **🌟 Lista de Desejos com Sorteador:** Indecisa sobre o que ler a seguir? A roleta **"Sortear próxima leitura ✨"** escolhe um livro aleatório da sua *Wishlist*.
- **❤️ Favoritos, Resenhas e Citações:** Marque os livros favoritos da vida, dê notas de 1 a 5 estrelas, anote datas de início/conclusão e guarde suas frases favoritas.
- **📊 Estatísticas e Meta Anual:** Desafio de leitura do ano com barra de progresso editável, paginômetro (total de páginas lidas), média de avaliações, gêneros favoritos, gráfico mensal e mural de citações.
- **📱 Responsivo & Drag-and-Drop:** Arraste e solte para reordenar os livros na prateleira e na lista de desejos.

## 🛠️ Tecnologias Utilizadas

- **[Next.js 16](https://nextjs.org/)** (App Router)
- **[React 19](https://react.dev/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[Prisma ORM v7](https://www.prisma.io/)** + **SQLite** (`@prisma/adapter-better-sqlite3`)

## 🚀 Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Aplique as migrations do banco de dados e gere o Prisma Client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000) no navegador.
