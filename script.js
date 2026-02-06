const API_KEY = "AIzaSyAJp5P_ceGfGgLquXQSnNUW8s6GgldZ4HA";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyZAMw7X899tkOtDbNtMygi_AgXfs55wFf08UuVQWiL1Q-Nt7K-7qOSe5YesO5s_e4eZw/exec";

const App = {
  currentSetor: null,
  currentSub: null,
  currentItems: [],

  links: {
    'Produção': {
      'PCP': { documentos: '#', instrucoes: '#', ferramentas: '#' },
      'Acabamento': { documentos: '#', instrucoes: '#', ferramentas: '#' },
      'Criação': { documentos: '#', instrucoes: '#', ferramentas: '#' },
      'Corte': { documentos: '#', instrucoes: '#', ferramentas: '#' }
    },
    'Almoxarifado': { documentos: '#', instrucoes: '1oboyv_pgo4sim9pbwkbdJm7-615moyzn', ferramentas: '#' },
    'Logística': { documentos: '#', instrucoes: '#', ferramentas: '#' },
    'Comercial': { documentos: '#', instrucoes: '#', ferramentas: '#' },
    'Financeiro': { documentos: '#', instrucoes: '#', ferramentas: '#' },
    'DHO': { documentos: '#', instrucoes: '#', ferramentas: '#' }
  },

  ferramentas: {
    'Produção': [{ name: "Download ERP", url: "https://seu-erp.com", icon: "download" }]
  },

  init() {
    this.checkSession(); // Verifica login ao iniciar
    this.bindEvents();
    lucide.createIcons();
  },

  // FUNÇÃO PARA PERSISTIR O LOGIN
  checkSession() {
    const savedUser = localStorage.getItem('bc_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.loginSuccess(user.NOME || user.nome);
    }
  },

  loginSuccess(userName) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appMain').classList.remove('hidden');
    document.getElementById('setorTitulo').textContent = `Bem-vindo, ${userName}`;
  },

  bindEvents() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    searchInput.oninput = (e) => {
      const term = e.target.value.toLowerCase();
      term.length > 0 ? clearBtn.classList.remove('hidden') : clearBtn.classList.add('hidden');
      const filtered = this.currentItems.filter(item => item.name.toLowerCase().includes(term));
      this.renderList(filtered);
    };

    clearBtn.onclick = () => {
      searchInput.value = "";
      clearBtn.classList.add('hidden');
      this.renderList(this.currentItems);
      searchInput.focus();
    };

    document.getElementById('themeToggle').onclick = () => {
      const isDark = document.body.classList.toggle('dark');
      document.getElementById('themeToggle').innerHTML = isDark ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
      lucide.createIcons();
    };

    document.getElementById('btnLogout').onclick = () => {
      localStorage.removeItem('bc_user'); // Limpa sessão
      window.location.reload();
    };

    document.getElementById('btnBack').onclick = () => this.showCards();
    document.getElementById('btnLogin').onclick = () => this.handleLogin();
    document.getElementById('viewGrid').onclick = () => this.toggleView('grid');
    document.getElementById('viewList').onclick = () => this.toggleView('list');

    document.getElementById('producaoBtn').onclick = () => {
      document.querySelector('.submenu').classList.toggle('open');
      document.getElementById('producaoBtn').querySelector('.arrow').classList.toggle('rotate');
    };

    document.querySelectorAll('.menu-item[data-setor], .submenu-item').forEach(btn => {
      btn.onclick = () => {
        const setor = btn.dataset.setor || 'Produção';
        const sub = btn.dataset.subsetor || null;
        this.selectSetor(setor, sub);
      };
    });
  },

  async handleLogin() {
    const id = document.getElementById('userIdInput').value.trim();
    if (!id) return;
    const btn = document.getElementById('btnLogin');
    btn.textContent = "Validando...";
    try {
      const res = await fetch(SCRIPT_URL);
      const data = await res.json();
      const found = data.find(u => String(u.ID || u.id).padStart(3, '0') === id.padStart(3, '0'));
      if (found) {
        localStorage.setItem('bc_user', JSON.stringify(found)); // Salva usuário
        this.loginSuccess(found.NOME || found.nome);
      } else {
        document.getElementById('loginError').classList.remove('hidden');
      }
    } catch (e) { alert("Erro ao conectar."); }
    btn.textContent = "Entrar";
  },

  selectSetor(setor, sub = null) {
    this.currentSetor = setor;
    this.currentSub = sub;
    this.showCards();
    document.getElementById('setorTitulo').textContent = sub ? `${setor} • ${sub}` : setor;
  },

  showCards() {
    document.getElementById('cardsContainer').classList.remove('hidden');
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('listHeader').classList.add('hidden');
    document.getElementById('btnBack').classList.add('hidden');
    document.getElementById('searchWrapper').classList.add('hidden');
    document.getElementById('searchInput').value = "";
    document.getElementById('clearSearch').classList.add('hidden');
  },

  toggleView(mode) {
    const container = document.getElementById('listView');
    if (mode === 'grid') {
      container.classList.add('grid-mode');
      document.getElementById('viewGrid').classList.add('active');
      document.getElementById('viewList').classList.remove('active');
    } else {
      container.classList.remove('grid-mode');
      document.getElementById('viewList').classList.add('active');
      document.getElementById('viewGrid').classList.remove('active');
    }
  },

  getIconConfig(mimeType) {
    if (mimeType === 'application/vnd.google-apps.folder') return { icon: 'folder', class: 'icon-folder' };
    if (mimeType === 'application/pdf') return { icon: 'file-text', class: 'icon-pdf' };
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return { icon: 'table-2', class: 'icon-sheet' };
    if (mimeType.includes('document') || mimeType.includes('word')) return { icon: 'file-text', class: 'icon-doc' };
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return { icon: 'presentation', class: 'icon-slides' };
    if (mimeType.includes('image/')) return { icon: 'image', class: 'icon-image' };
    if (mimeType.includes('video/')) return { icon: 'play-circle', class: 'icon-video' };
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return { icon: 'archive', class: 'icon-zip' };
    return { icon: 'file', class: '' };
  },

  async openDrive(tipo) {
    const container = document.getElementById('listView');
    const header = document.getElementById('listHeader');
    const search = document.getElementById('searchWrapper');

    document.getElementById('cardsContainer').classList.add('hidden');
    document.getElementById('btnBack').classList.remove('hidden');
    container.classList.remove('hidden');
    header.classList.remove('hidden');
    search.classList.remove('hidden');
    container.innerHTML = "<p>Carregando...</p>";

    if (tipo === 'ferramentas') {
      const toolSet = this.currentSub ? (this.ferramentas[this.currentSub] || []) : (this.ferramentas[this.currentSetor] || []);
      this.currentItems = toolSet;
      this.renderList(this.currentItems, true);
      return;
    }

    const folderId = this.currentSub ? this.links[this.currentSetor][this.currentSub][tipo] : this.links[this.currentSetor][tipo];

    if (!folderId || folderId === '#') {
      container.innerHTML = "<p>Pasta não configurada.</p>";
      return;
    }

    try {
      const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink)&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      this.currentItems = data.files.map(f => ({
        name: f.name,
        url: f.webViewLink,
        mimeType: f.mimeType
      }));
      this.renderList(this.currentItems);
    } catch (e) {
      container.innerHTML = "<p>Erro ao carregar arquivos.</p>";
    }
  },

  renderList(items, isFerramenta = false) {
    const container = document.getElementById('listView');
    container.innerHTML = items.length ? "" : "<p>Vazio.</p>";
    items.forEach(item => {
      const config = isFerramenta ? { icon: item.icon || 'link', class: '' } : this.getIconConfig(item.mimeType);
      const el = document.createElement('a');
      el.className = "list-item";
      el.href = item.url;
      el.target = "_blank";
      el.innerHTML = `<i data-lucide="${config.icon}" class="${config.class}"></i><span>${item.name}</span>`;
      container.appendChild(el);
    });
    lucide.createIcons();
  }
};

App.init();