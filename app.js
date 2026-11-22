/* ==========================================================================
   iPod Classic (6ª Geração) — Sistema Operacional & Central de Mídia
   ========================================================================== */

(() => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. GERADOR DE CAPAS SVG / CANVAS & ÁUDIO DEMO EMBUTIDO
  // --------------------------------------------------------------------------
  function createCoverArt(bg1, bg2, title, subtitle, icon = '♪') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#g)"/>
      <circle cx="150" cy="120" r="56" fill="rgba(255,255,255,0.14)"/>
      <text x="150" y="138" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="54" fill="rgba(255,255,255,0.9)">${icon}</text>
      <text x="150" y="222" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="22" fill="#ffffff">${title}</text>
      <text x="150" y="250" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" fill="rgba(255,255,255,0.8)">${subtitle}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Capa especial inspirada no álbum "Sleep Through the Static" (Jack Johnson) da foto do usuário!
  function createJackJohnsonCover() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="jj" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c08497"/>
          <stop offset="45%" stop-color="#d8f3dc"/>
          <stop offset="100%" stop-color="#52b788"/>
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#jj)"/>
      <!-- Silhueta artística no banquinho com violão e microfone -->
      <ellipse cx="145" cy="245" rx="115" ry="22" fill="rgba(0,0,0,0.35)"/>
      <line x1="210" y1="115" x2="210" y2="245" stroke="#111" stroke-width="4"/>
      <line x1="185" y1="115" x2="225" y2="122" stroke="#111" stroke-width="4"/>
      <polygon points="195,248 225,248 210,238" fill="#111"/>
      <!-- Banquinho e músico -->
      <line x1="55" y1="185" x2="50" y2="255" stroke="#111" stroke-width="4"/>
      <line x1="85" y1="185" x2="90" y2="255" stroke="#111" stroke-width="4"/>
      <line x1="52" y1="220" x2="88" y2="220" stroke="#111" stroke-width="3"/>
      <circle cx="72" cy="92" r="16" fill="#111"/>
      <path d="M50,115 Q75,110 92,145 L88,188 L52,188 Z" fill="#111"/>
      <path d="M88,180 L118,225 L100,235 L70,188 Z" fill="#111"/>
      <!-- Assinatura estilo manuscrito -->
      <text x="155" y="198" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-style="italic" font-size="34" fill="#ffffff" stroke="#111" stroke-width="1">Jack Johnson</text>
      <text x="165" y="216" text-anchor="middle" font-family="Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#111">Sleep Through the Static</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Gerador de WAV procedural em memória para que toda música demo toque som real mesmo offline!
  function generateDemoMelodyWav(seedFreq = 220, tempo = 120, style = 'acoustic') {
    const sampleRate = 22050;
    const durationSeconds = 24;
    const numSamples = sampleRate * durationSeconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const scale = [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2];
    const pattern = style === 'upbeat'
      ? [0, 2, 4, 7, 4, 2, 5, 4, 0, 3, 5, 7, 5, 3, 2, 4]
      : [0, 4, 2, 5, 3, 4, 2, 0, 4, 7, 5, 4, 2, 3, 1, 0];
    const beatDur = 60 / tempo;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beatIndex = Math.floor(t / (beatDur / 2));
      const noteInBeat = t % (beatDur / 2);
      const deg = pattern[beatIndex % pattern.length];
      const freq = seedFreq * scale[deg];
      const bassFreq = (seedFreq / 2) * scale[pattern[Math.floor(beatIndex / 4) % 4]];

      // Envelope de corda dedilhada (violão/synth suave)
      const env = Math.exp(-noteInBeat * 6.5);
      const lead = (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(4 * Math.PI * freq * t)) * env;
      const bassEnv = Math.exp(-(t % beatDur) * 3.2);
      const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnv * 0.45;

      const sample = Math.max(-0.9, Math.min(0.9, (lead * 0.45 + bass * 0.35)));
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // --------------------------------------------------------------------------
  // 2. BIBLIOTECA INICIAL (MÚSICAS, VÍDEOS, FOTOS, NOTAS)
  // --------------------------------------------------------------------------
  const jackCover = createJackJohnsonCover();

  const state = {
    locked: false,
    theme: 'light', // 'light' | 'dark'
    coverFlowStyle: 'original', // 'original' | 'flat' | 'carousel'
    wheelSize: 'large', // 'small' | 'medium' | 'large'
    wheelSensitivity: 'medium', // 'low' | 'medium' | 'high'
    touchScreenEnabled: true,
    clickSoundEnabled: true,
    vibrateEnabled: true,
    volumeControlMode: 'app', // 'app' | 'device'
    splitScreenEnabled: true,
    backlightOn: true,
    shuffle: false, // false | 'songs'
    repeat: 'off',  // 'off' | 'one' | 'all'
    skinIndex: 0,
    skins: [
      { id: 'skin-silver', name: 'Prata', hex: 'linear-gradient(145deg, #f3f4f6, #b2b8c2)' },
      { id: 'skin-black', name: 'Preto', hex: 'linear-gradient(145deg, #6b7280, #1f2937)' },
      { id: 'skin-oled-black', name: 'OLED preto', hex: '#000000' },
      { id: 'skin-red', name: 'Vermelho', hex: 'linear-gradient(145deg, #ef4444, #991b1b)' },
      { id: 'skin-orange', name: 'Laranja', hex: 'linear-gradient(145deg, #fdba74, #ea580c)' },
      { id: 'skin-yellow', name: 'Amarelo', hex: 'linear-gradient(145deg, #fde047, #ca8a04)' },
      { id: 'skin-gold', name: 'Ouro', hex: 'linear-gradient(145deg, #fde68a, #a16207)' },
      { id: 'skin-lime', name: 'Lima', hex: 'linear-gradient(145deg, #bef264, #65a30d)' },
      { id: 'skin-green', name: 'Verde', hex: 'linear-gradient(145deg, #86efac, #15803d)' },
      { id: 'skin-blue', name: 'Azul', hex: 'linear-gradient(145deg, #60a5fa, #1d4ed8)' },
      { id: 'skin-pink', name: 'Rosa', hex: 'linear-gradient(145deg, #f9a8d4, #db2777)' },
      { id: 'skin-purple', name: 'Roxo', hex: 'linear-gradient(145deg, #c084fc, #6b21a8)' },
      { id: 'skin-white', name: 'Branco', hex: 'linear-gradient(145deg, #ffffff, #cbd5e1)' }
    ],

    // Pilha de navegação de menus
    navStack: [],
    currentView: 'split', // 'split' | 'full' | 'now-playing' | 'coverflow' | 'video' | 'photos' | 'game' | 'extra'

    // Player de Áudio
    playlist: [],
    currentTrackIndex: 0,
    isPlaying: false,
    volume: 0.8,
    npMode: 'volume', // 'volume' | 'scrub' | 'rating'
    npModeTimeout: null,

    // Cover Flow
    coverFlowAlbums: [],
    coverFlowIndex: 0,

    // Fotos
    photoIndex: 0,
    photoViewerOpen: false,
    slideshowTimer: null,

    // Dados da Biblioteca
    deletedBuiltinIds: [],
    songEdits: {},
    songEditsByName: {},
    customPlaylists: [
      {
        id: 'pl-favoritas-2008',
        name: 'Favoritas 2008',
        songIds: ['jj-1', 'jj-2', 'dp-1', 'cp-1', 'br-1']
      }
    ],
    songs: [
      {
        id: 'jj-1',
        title: 'If I Had Eyes',
        artist: 'Jack Johnson',
        album: 'Sleep Through the Static',
        rating: 5,
        cover: jackCover,
        url: generateDemoMelodyWav(220, 108, 'acoustic'),
        isDemo: true
      },
      {
        id: 'jj-2',
        title: 'All At Once',
        artist: 'Jack Johnson',
        album: 'Sleep Through the Static',
        rating: 5,
        cover: jackCover,
        url: generateDemoMelodyWav(196, 98, 'acoustic'),
        isDemo: true
      },
      {
        id: 'jj-3',
        title: 'Sleep Through the Static',
        artist: 'Jack Johnson',
        album: 'Sleep Through the Static',
        rating: 4,
        cover: jackCover,
        url: generateDemoMelodyWav(246.94, 114, 'acoustic'),
        isDemo: true
      },
      {
        id: 'jj-4',
        title: 'Hope',
        artist: 'Jack Johnson',
        album: 'Sleep Through the Static',
        rating: 5,
        cover: jackCover,
        url: generateDemoMelodyWav(261.63, 120, 'upbeat'),
        isDemo: true
      },
      {
        id: 'dp-1',
        title: 'One More Time (Retro Synth)',
        artist: 'Daft Club',
        album: 'Discovery 2007',
        rating: 5,
        cover: createCoverArt('#1e1b4b', '#ec4899', 'Discovery', 'Daft Club', '⚡'),
        url: generateDemoMelodyWav(293.66, 128, 'upbeat'),
        isDemo: true
      },
      {
        id: 'cp-1',
        title: 'Viva La Vida (Acoustic)',
        artist: 'Coldplay Tribute',
        album: 'Viva 2008',
        rating: 5,
        cover: createCoverArt('#7f1d1d', '#f59e0b', 'Viva 2008', 'Coldplay Tribute', '👑'),
        url: generateDemoMelodyWav(261.63, 132, 'upbeat'),
        isDemo: true
      },
      {
        id: 'am-1',
        title: 'Fluorescent Adolescent',
        artist: 'Indie Monkeys',
        album: 'Favourite Worst Nightmare',
        rating: 4,
        cover: createCoverArt('#064e3b', '#10b981', 'Indie Classics', '2007', '🎸'),
        url: generateDemoMelodyWav(233.08, 124, 'upbeat'),
        isDemo: true
      },
      {
        id: 'br-1',
        title: 'Céu Azul (Sessão Acústica)',
        artist: 'Rock Brasil 2000',
        album: 'Acústico Skate',
        rating: 5,
        cover: createCoverArt('#0c4a6e', '#38bdf8', 'Rock Brasil', 'Anos 2000', '🛹'),
        url: generateDemoMelodyWav(220, 112, 'acoustic'),
        isDemo: true
      }
    ],

    videos: [
      {
        id: 'vid-1',
        title: 'Big Buck Bunny (Clássico HD)',
        artist: 'Blender Foundation',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        cover: createCoverArt('#14532d', '#4ade80', 'Big Buck Bunny', 'Animação Clássica', '🎬')
      },
      {
        id: 'vid-2',
        title: 'Elephants Dream (Sci-Fi)',
        artist: 'Open Movie Project',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        cover: createCoverArt('#312e81', '#818cf8', 'Elephants Dream', 'Curta Sci-Fi', '🎞️')
      },
      {
        id: 'vid-3',
        title: 'For Bigger Blazes (Comercial)',
        artist: 'iPod Video Showcase',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        cover: createCoverArt('#7c2d12', '#fb923c', 'iPod Video', 'Showcase', '📺')
      }
    ],

    photos: [
      {
        id: 'ph-1',
        title: 'Capa: Sleep Through the Static',
        url: jackCover
      },
      {
        id: 'ph-2',
        title: 'Pôr do Sol na Praia (Hawaii)',
        url: createCoverArt('#7c2d12', '#facc15', 'Sunset Hawaii', 'North Shore 2008', '🌅')
      },
      {
        id: 'ph-3',
        title: 'Mac OS X Leopard Aurora',
        url: createCoverArt('#3b0764', '#ec4899', 'Aurora 2007', 'iPod Photo Library', '🌌')
      },
      {
        id: 'ph-4',
        title: 'Montanhas Yosemite',
        url: createCoverArt('#064e3b', '#38bdf8', 'Yosemite', 'California', '🏔️')
      },
      {
        id: 'ph-5',
        title: 'Noite Neon Tokyo',
        url: createCoverArt('#1e1b4b', '#22d3ee', 'Tokyo Neon', 'Viagem 2008', '🌃')
      },
      {
        id: 'ph-6',
        title: 'Coleção Vinil & Café',
        url: createCoverArt('#451a03', '#d97706', 'Acoustic Sessions', 'Estúdio', '☕')
      }
    ],

    notes: [
      {
        title: 'Bem-vindo ao seu iPod Classic!',
        body: 'Este iPod virtual recria o clássico iPod de 6ª Geração (160GB).\n\n• Use a Click Wheel girando o mouse em círculos ou as setas ↑ ↓.\n• Clique em "+ Arquivos" ou "+ Pasta" no topo para carregar suas próprias músicas MP3, vídeos MP4 e fotos JPG/PNG.\n• Use "+ Mídia Online" para buscar músicas reais na iTunes Store!'
      },
      {
        title: 'Atalhos da Tela Now Playing',
        body: 'Enquanto uma música está tocando na tela "Now Playing":\n\n1. Gire a roda para ajustar o Volume.\n2. Aperte o botão Central 1x para avançar/retroceder na barra de tempo (Scrubber).\n3. Aperte o botão Central 2x para classificar a música de 1 a 5 estrelas (★★★★★)!'
      },
      {
        title: 'Setlist Favorita 2008',
        body: '1. Jack Johnson - If I Had Eyes\n2. Jack Johnson - All At Once\n3. Daft Punk - One More Time\n4. Coldplay - Viva La Vida\n5. Charlie Brown Jr - Céu Azul'
      }
    ]
  };

  const DEFAULT_SONGS = state.songs.map((s) => ({ ...s }));
  const DEFAULT_VIDEOS = state.videos.map((v) => ({ ...v }));
  const DEFAULT_PHOTOS = state.photos.map((p) => ({ ...p }));

  // --------------------------------------------------------------------------
  // 3. REFERÊNCIAS DO DOM
  // --------------------------------------------------------------------------
  const dom = {
    ipodShell: document.getElementById('ipod-shell'),
    holdSwitch: document.getElementById('hold-switch'),
    statusLock: document.getElementById('status-lock'),
    statusTitle: document.getElementById('status-title'),
    statusPlayIcon: document.getElementById('status-play-icon'),

    viewSplit: document.getElementById('view-split'),
    menuList: document.getElementById('menu-list'),
    splitPreview: document.getElementById('split-preview'),

    viewFullList: document.getElementById('view-full-list'),
    fullMenuList: document.getElementById('full-menu-list'),

    viewNowPlaying: document.getElementById('view-now-playing'),
    npArtwork: document.getElementById('np-artwork'),
    npArtworkReflection: document.getElementById('np-artwork-reflection'),
    npTitle: document.getElementById('np-title'),
    npArtist: document.getElementById('np-artist'),
    npAlbum: document.getElementById('np-album'),
    npRating: document.getElementById('np-rating'),
    npTrackIndex: document.getElementById('np-track-index'),
    npShuffleBadge: document.getElementById('np-shuffle-badge'),
    npRepeatBadge: document.getElementById('np-repeat-badge'),
    npEditBtn: document.getElementById('np-edit-btn'),
    npDeleteBtn: document.getElementById('np-delete-btn'),
    npTimeRow: document.getElementById('np-time-row'),
    npCurrentTime: document.getElementById('np-current-time'),
    npRemainingTime: document.getElementById('np-remaining-time'),
    npProgressContainer: document.getElementById('np-progress-container'),
    npProgressFill: document.getElementById('np-progress-fill'),
    npScrubberDiamond: document.getElementById('np-scrubber-diamond'),
    npVolumeRow: document.getElementById('np-volume-row'),
    npVolumeFill: document.getElementById('np-volume-fill'),

    viewCoverflow: document.getElementById('view-coverflow'),
    cfStage: document.getElementById('cf-stage'),
    cfAlbumTitle: document.getElementById('cf-album-title'),
    cfAlbumArtist: document.getElementById('cf-album-artist'),

    viewVideo: document.getElementById('view-video'),
    videoEl: document.getElementById('ipod-video'),
    ytPlayerWrap: document.getElementById('yt-player-wrap'),
    videoHud: document.getElementById('video-hud'),
    videoTitle: document.getElementById('video-title'),
    vidCurrentTime: document.getElementById('vid-current-time'),
    vidRemainingTime: document.getElementById('vid-remaining-time'),
    vidProgressContainer: document.getElementById('vid-progress-container'),
    vidProgressFill: document.getElementById('vid-progress-fill'),

    viewPhotos: document.getElementById('view-photos'),
    photoGrid: document.getElementById('photo-grid'),
    photoViewer: document.getElementById('photo-viewer'),
    photoFullImg: document.getElementById('photo-full-img'),
    photoTitle: document.getElementById('photo-title'),
    photoCounter: document.getElementById('photo-counter'),

    viewGame: document.getElementById('view-game'),
    gameCanvas: document.getElementById('game-canvas'),

    viewExtra: document.getElementById('view-extra'),
    extraContent: document.getElementById('extra-content'),

    lcdBezelSlot: document.getElementById('lcd-bezel-slot'),
    lcdBezel: document.getElementById('lcd-bezel'),
    clickWheelSlot: document.getElementById('click-wheel-slot'),
    clickWheel: document.getElementById('click-wheel'),
    btnMenu: document.getElementById('btn-menu'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnPlay: document.getElementById('btn-play'),
    btnSelect: document.getElementById('btn-select'),

    audioEl: document.getElementById('ipod-audio'),
    fileInput: document.getElementById('file-input'),
    folderInput: document.getElementById('folder-input'),
    backupInput: document.getElementById('backup-input'),
    btnOnlineModal: document.getElementById('btn-online-modal'),
    btnSkinToggle: document.getElementById('btn-skin-toggle'),
    dropZone: document.getElementById('drop-zone'),

    statSongs: document.getElementById('stat-songs'),
    statVideos: document.getElementById('stat-videos'),
    statPhotos: document.getElementById('stat-photos'),

    onlineModal: document.getElementById('online-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnAddCustomUrl: document.getElementById('btn-add-custom-url'),

    editSongModal: document.getElementById('edit-song-modal'),
    btnCloseEditSong: document.getElementById('btn-close-edit-song'),
    editSongSelect: document.getElementById('edit-song-select'),
    editSongTitle: document.getElementById('edit-song-title'),
    editSongArtist: document.getElementById('edit-song-artist'),
    editSongAlbum: document.getElementById('edit-song-album'),
    editSongCoverPreview: document.getElementById('edit-song-cover-preview'),
    editSongCoverFile: document.getElementById('edit-song-cover-file'),
    editSongCoverUrl: document.getElementById('edit-song-cover-url'),
    editSongCoverScope: document.getElementById('edit-song-cover-scope'),
    btnSaveEditSong: document.getElementById('btn-save-edit-song'),

    playlistModal: document.getElementById('playlist-modal'),
    playlistModalTitle: document.getElementById('playlist-modal-title'),
    btnClosePlaylistModal: document.getElementById('btn-close-playlist-modal'),
    playlistEditId: document.getElementById('playlist-edit-id'),
    playlistNameInput: document.getElementById('playlist-name-input'),
    btnPlaylistSelectAll: document.getElementById('btn-playlist-select-all'),
    btnPlaylistClearAll: document.getElementById('btn-playlist-clear-all'),
    playlistSongsChecklist: document.getElementById('playlist-songs-checklist'),
    btnSavePlaylist: document.getElementById('btn-save-playlist')
  };

  // --------------------------------------------------------------------------
  // 4. EFEITO SONORO & VIBRAÇÃO TÁTIL DA CLICK WHEEL (PIEZO CLICKER + HAPTIC)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  function triggerHapticPulse(durationMs = 10) {
    if (!state.vibrateEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(durationMs);
      }
    } catch (_) {}
  }

  function playWheelClick(hapticMs = 10) {
    triggerHapticPulse(hapticMs);
    if (!state.clickSoundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;

      // 1. Estalo agudo característico do piezo interno do iPod Classic
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1750, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.009);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.009);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.01);

      // 2. Pulso grave sub-tátil curto (sensação física do motor tátil no alto-falante)
      const thumpOsc = audioCtx.createOscillator();
      const thumpGain = audioCtx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(95, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(38, now + 0.012);

      thumpGain.gain.setValueAtTime(0.22, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(audioCtx.destination);
      thumpOsc.start(now);
      thumpOsc.stop(now + 0.013);
    } catch (_) {
      // Ignorar caso o navegador ainda não tenha desbloqueado áudio
    }
  }

  // --------------------------------------------------------------------------
  // 5. ESTRUTURA DE MENUS DO IPOD CLASSIC
  // --------------------------------------------------------------------------
  function getUniqueAlbums() {
    const map = new Map();
    state.songs.forEach((s) => {
      const key = `${s.album}___${s.artist}`;
      if (!map.has(key)) {
        map.set(key, {
          album: s.album || 'Álbum Desconhecido',
          artist: s.artist || 'Artista Desconhecido',
          cover: s.cover,
          songs: []
        });
      }
      map.get(key).songs.push(s);
    });
    return Array.from(map.values());
  }

  function getUniqueArtists() {
    const map = new Map();
    state.songs.forEach((s) => {
      const artist = s.artist || 'Artista Desconhecido';
      if (!map.has(artist)) {
        map.set(artist, { artist, cover: s.cover, songs: [] });
      }
      map.get(artist).songs.push(s);
    });
    return Array.from(map.values());
  }

  function buildRootMenu() {
    return {
      title: 'iPod',
      split: true,
      selectedIndex: 0,
      items: [
        {
          label: 'Músicas',
          previewType: 'music',
          action: () => pushMenu(buildMusicMenu())
        },
        {
          label: 'Vídeos',
          previewType: 'videos',
          action: () => pushMenu(buildVideosMenu())
        },
        {
          label: 'Fotos',
          previewType: 'photos',
          action: () => pushMenu(buildPhotosMenu())
        },
        {
          label: 'Cover Flow',
          previewType: 'coverflow',
          action: () => openCoverFlowView()
        },
        {
          label: 'Cor',
          getSub: () => state.skins[state.skinIndex].name,
          previewType: 'color',
          action: () => pushMenu(buildColorMenu())
        },
        {
          label: 'Tela Cheia',
          getSub: () => (document.fullscreenElement ? 'Ativo' : 'Desl.'),
          previewType: 'fullscreen',
          action: () => toggleFullscreen()
        },
        {
          label: 'Instalar App',
          getSub: () => (deferredInstallPrompt ? 'Pronto' : 'PWA'),
          previewType: 'install',
          action: () => installPwaApp()
        },
        {
          label: ' + Mídia / YouTube',
          previewType: 'import',
          action: () => pushMenu(buildImportMenu())
        },
        {
          label: 'Extras',
          previewType: 'extras',
          action: () => pushMenu(buildExtrasMenu())
        },
        {
          label: 'Configurações',
          previewType: 'settings',
          action: () => pushMenu(buildSettingsMenu())
        },
        {
          label: 'Aleatório',
          previewType: 'shuffle',
          action: () => startShuffleAll()
        },
        {
          label: 'Reproduzindo',
          previewType: 'nowplaying',
          action: () => showView('now-playing', 'Reproduzindo Agora')
        }
      ]
    };
  }

  function buildColorMenu() {
    return {
      title: 'Cor do Dispositivo',
      split: false,
      selectedIndex: state.skinIndex,
      items: state.skins.map((skin, idx) => ({
        label: skin.name,
        colorDot: skin.hex,
        hasArrow: true,
        action: () => {
          setSkinByIndex(idx);
          popMenu();
        }
      }))
    };
  }

  function buildImportMenu() {
    return {
      title: 'Adicionar Mídia',
      split: false,
      selectedIndex: 0,
      items: [
        {
          label: '▶️ Link do YouTube (Vídeo)',
          hasArrow: true,
          action: () => openOnlineModal('youtube-video')
        },
        {
          label: '🎵 Link do YouTube (Música)',
          hasArrow: true,
          action: () => openOnlineModal('youtube-song')
        },
        {
          label: '📁 + Arquivos do PC / Celular',
          hasArrow: false,
          action: () => dom.fileInput.click()
        },
        {
          label: '📂 + Pasta Inteira do PC',
          hasArrow: false,
          action: () => dom.folderInput.click()
        },
        {
          label: '💾 Salvar Backup em Arquivo',
          hasArrow: false,
          action: () => exportLibraryBackupFile()
        },
        {
          label: '📥 Carregar Arquivo de Backup',
          hasArrow: false,
          action: () => dom.backupInput && dom.backupInput.click()
        }
      ]
    };
  }

  function deleteSongById(songId) {
    if (!songId) return;
    const currentTrack = state.playlist[state.currentTrackIndex];
    const wasCurrent = currentTrack && currentTrack.id === songId;
    const wasPlaying = !dom.audioEl.paused || isYouTubePlaying();
    const idxInPlaylist = state.playlist.findIndex((s) => s.id === songId);

    state.songs = state.songs.filter((s) => s.id !== songId);
    state.playlist = state.playlist.filter((s) => s.id !== songId);
    delete state.songEdits[songId];
    idbDeleteMediaItem(songId);
    state.customPlaylists.forEach((pl) => {
      pl.songIds = pl.songIds.filter((id) => id !== songId);
    });

    if (BUILTIN_IDS.has(songId) && !state.deletedBuiltinIds.includes(songId)) {
      state.deletedBuiltinIds.push(songId);
    }

    if (wasCurrent) {
      dom.audioEl.pause();
      dom.audioEl.removeAttribute('src');
      dom.audioEl.load();
      delete dom.audioEl.dataset.ytFallbackId;
      stopYouTubePlayback();
      dom.npCurrentTime.textContent = '0:00';
      dom.npRemainingTime.textContent = '-0:00';
      dom.npProgressFill.style.width = '0%';
      dom.npScrubberDiamond.style.left = '0%';

      if (!state.playlist.length && state.songs.length) {
        state.playlist = [...state.songs];
      }
      state.currentTrackIndex = Math.max(0, Math.min(state.currentTrackIndex, state.playlist.length - 1));

      if (state.playlist.length && wasPlaying) {
        loadAndPlayCurrentTrack();
      } else {
        updateNowPlayingUI();
      }
    } else if (idxInPlaylist !== -1 && idxInPlaylist < state.currentTrackIndex) {
      state.currentTrackIndex = Math.max(0, state.currentTrackIndex - 1);
      updateNowPlayingUI();
    } else {
      updateNowPlayingUI();
    }

    updateLibraryStats();
    savePersistedState();
    updateStatusPlayIcon();
  }

  function clearLoadedSongs() {
    const userSongIds = state.songs
      .filter((s) => !BUILTIN_IDS.has(s.id) && !s.isDemo)
      .map((s) => s.id);
    userSongIds.forEach((id) => deleteSongById(id));
  }

  function deleteVideoById(videoId) {
    if (!videoId) return;
    state.videos = state.videos.filter((v) => v.id !== videoId);
    idbDeleteMediaItem(videoId);
    if (BUILTIN_IDS.has(videoId) && !state.deletedBuiltinIds.includes(videoId)) {
      state.deletedBuiltinIds.push(videoId);
    }
    updateLibraryStats();
    savePersistedState();
  }

  function deletePhotoById(photoId) {
    if (!photoId) return;
    state.photos = state.photos.filter((p) => p.id !== photoId);
    idbDeleteMediaItem(photoId);
    if (BUILTIN_IDS.has(photoId) && !state.deletedBuiltinIds.includes(photoId)) {
      state.deletedBuiltinIds.push(photoId);
    }
    state.photoIndex = Math.max(0, Math.min(state.photoIndex, state.photos.length - 1));
    updateLibraryStats();
    savePersistedState();
  }

  function restoreDefaultLibrary() {
    state.deletedBuiltinIds = [];
    state.songEdits = {};
    const existingSongIds = new Set(state.songs.map((s) => s.id));
    DEFAULT_SONGS.forEach((s) => {
      if (!existingSongIds.has(s.id)) {
        state.songs.push({ ...s });
      } else {
        const current = state.songs.find((item) => item.id === s.id);
        if (current) Object.assign(current, s);
      }
    });
    const existingVideoIds = new Set(state.videos.map((v) => v.id));
    DEFAULT_VIDEOS.forEach((v) => {
      if (!existingVideoIds.has(v.id)) state.videos.push({ ...v });
    });
    const existingPhotoIds = new Set(state.photos.map((p) => p.id));
    DEFAULT_PHOTOS.forEach((p) => {
      if (!existingPhotoIds.has(p.id)) state.photos.push({ ...p });
    });
    if (!state.playlist.length) {
      state.playlist = [...state.songs];
      state.currentTrackIndex = 0;
    }
    updateLibraryStats();
    updateNowPlayingUI();
    savePersistedState();
    renderCurrentMenu();
  }

  function buildPhotosMenu() {
    const menu = {
      title: 'Fotos',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => [
      {
        label: 'Ver Álbum de Fotos',
        sub: `${state.photos.length}`,
        hasArrow: true,
        action: () => openPhotosView()
      },
      {
        label: '📁 + Carregar Fotos do PC...',
        hasArrow: false,
        action: () => dom.fileInput.click()
      },
      {
        label: '🌐 + Foto por Link (URL)...',
        hasArrow: false,
        action: () => openOnlineModal('photo')
      },
      {
        label: '🗑️ Excluir Fotos...',
        hasArrow: true,
        action: () => pushMenu(buildDeletePhotosMenu())
      }
    ];
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildDeletePhotosMenu() {
    const menu = {
      title: 'Excluir Fotos',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      if (!state.photos.length) {
        return [{ label: 'Nenhuma foto na biblioteca', hasArrow: false, action: () => popMenu() }];
      }
      return state.photos.map((ph) => ({
        label: `🗑️ ${ph.title}`,
        hasArrow: false,
        action: () => {
          deletePhotoById(ph.id);
          menu.refresh();
          renderCurrentMenu();
        }
      }));
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildMusicMenu() {
    return {
      title: 'Músicas',
      split: true,
      selectedIndex: 0,
      items: [
        {
          label: 'Cover Flow',
          previewType: 'coverflow',
          action: () => openCoverFlowView()
        },
        {
          label: 'Playlists',
          getSub: () => `${state.customPlaylists.length}`,
          previewType: 'music',
          action: () => pushMenu(buildPlaylistsMenu())
        },
        {
          label: 'Todas as Músicas',
          previewType: 'music',
          action: () => pushMenu(buildSongListMenu('Músicas', () => state.songs))
        },
        {
          label: 'Artistas',
          previewType: 'music',
          action: () => pushMenu(buildArtistsMenu())
        },
        {
          label: 'Álbuns',
          previewType: 'music',
          action: () => pushMenu(buildAlbumsMenu())
        },
        {
          label: '✏️ Editar Música / Capa',
          previewType: 'music',
          action: () => pushMenu(buildEditSongsMenu())
        },
        {
          label: 'Mais Bem Avaliadas',
          previewType: 'music',
          action: () => {
            pushMenu(buildSongListMenu('★★★★★ Favoritas', () => {
              const top = state.songs.filter((s) => (s.rating || 0) >= 5);
              return top.length ? top : state.songs;
            }));
          }
        },
        {
          label: '+ Carregar Arquivos do PC',
          previewType: 'music',
          action: () => dom.fileInput.click()
        },
        {
          label: '+ Carregar Pasta do PC',
          previewType: 'music',
          action: () => dom.folderInput.click()
        },
        {
          label: '+ Link do YouTube',
          previewType: 'music',
          action: () => openOnlineModal('youtube-song')
        },
        {
          label: '💾 Salvar Backup (.json)',
          previewType: 'music',
          action: () => exportLibraryBackupFile()
        },
        {
          label: '📥 Carregar Backup (.json)',
          previewType: 'music',
          action: () => dom.backupInput && dom.backupInput.click()
        },
        {
          label: '🗑️ Excluir Músicas',
          previewType: 'music',
          action: () => pushMenu(buildDeleteSongsMenu())
        }
      ]
    };
  }

  function buildArtistsMenu() {
    const menu = {
      title: 'Artistas',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      const artists = getUniqueArtists();
      if (!artists.length) {
        return [{ label: 'Nenhum artista na biblioteca', hasArrow: false, action: () => popMenu() }];
      }
      return artists.map((a) => ({
        label: a.artist,
        sub: `${a.songs.length}`,
        hasArrow: true,
        action: () => pushMenu(buildSongListMenu(a.artist, () => state.songs.filter((s) => (s.artist || 'Artista Desconhecido') === a.artist))),
        onEdit: () => {
          if (a.songs[0]) openEditSongModal(a.songs[0].id, 'artist');
        }
      }));
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildAlbumsMenu() {
    const menu = {
      title: 'Álbuns',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      const albums = getUniqueAlbums();
      if (!albums.length) {
        return [{ label: 'Nenhum álbum na biblioteca', hasArrow: false, action: () => popMenu() }];
      }
      return albums.map((al) => ({
        label: al.album,
        sub: al.artist,
        hasArrow: true,
        action: () => pushMenu(buildSongListMenu(al.album, () => state.songs.filter((s) => (s.album || 'Álbum Desconhecido') === al.album && (s.artist || 'Artista Desconhecido') === al.artist))),
        onEdit: () => {
          if (al.songs[0]) openEditSongModal(al.songs[0].id, 'album');
        }
      }));
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildEditSongsMenu() {
    const menu = {
      title: 'Editar Música / Capa',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      if (!state.songs.length) {
        return [{ label: 'Nenhuma música para editar', hasArrow: false, action: () => popMenu() }];
      }
      return state.songs.map((song) => ({
        label: `✏️ ${song.title}`,
        sub: `${song.artist} • ${song.album}`,
        hasArrow: true,
        action: () => openEditSongModal(song.id, 'song')
      }));
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function getPlaylistSongs(pl) {
    if (!pl || !Array.isArray(pl.songIds)) return [];
    const map = new Map(state.songs.map((s) => [s.id, s]));
    return pl.songIds.map((id) => map.get(id)).filter(Boolean);
  }

  function deletePlaylistById(playlistId) {
    state.customPlaylists = state.customPlaylists.filter((p) => p.id !== playlistId);
    savePersistedState();
    refreshAllMenusInStack();
  }

  function buildPlaylistsMenu() {
    const menu = {
      title: 'Playlists',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      const items = [
        {
          label: '➕ Criar Nova Playlist...',
          hasArrow: true,
          action: () => openPlaylistModal()
        }
      ];
      state.customPlaylists.forEach((pl) => {
        const songsInPl = getPlaylistSongs(pl);
        items.push({
          label: `🎶 ${pl.name}`,
          sub: `${songsInPl.length}`,
          hasArrow: true,
          action: () => pushMenu(buildSinglePlaylistMenu(pl.id)),
          onEdit: () => openPlaylistModal(pl.id),
          onDelete: () => {
            deletePlaylistById(pl.id);
            menu.refresh();
            renderCurrentMenu();
          }
        });
      });
      return items;
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildSinglePlaylistMenu(playlistId) {
    const menu = {
      title: 'Playlist',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      const pl = state.customPlaylists.find((p) => p.id === playlistId);
      if (!pl) {
        return [{ label: 'Playlist não encontrada', hasArrow: false, action: () => popMenu() }];
      }
      menu.title = pl.name;
      const songsInPl = getPlaylistSongs(pl);
      const items = [
        {
          label: '▶️ Tocar Playlist',
          sub: `${songsInPl.length} músicas`,
          hasArrow: true,
          action: () => {
            if (songsInPl.length) playPlaylist(songsInPl, 0);
          }
        },
        {
          label: '🔀 Ordem Aleatória',
          hasArrow: true,
          action: () => {
            if (songsInPl.length) {
              const shuffled = [...songsInPl].sort(() => Math.random() - 0.5);
              playPlaylist(shuffled, 0);
            }
          }
        },
        {
          label: '✏️ Editar / Escolher Músicas...',
          hasArrow: true,
          action: () => openPlaylistModal(pl.id)
        },
        {
          label: '➕ Adicionar Música pelo Menu...',
          hasArrow: true,
          action: () => pushMenu(buildAddSongsToPlaylistMenu(pl.id))
        }
      ];

      songsInPl.forEach((song, idx) => {
        items.push({
          label: song.title,
          sub: song.artist,
          hasArrow: true,
          action: () => playPlaylist(songsInPl, idx),
          onEdit: () => openEditSongModal(song.id, 'song'),
          onDelete: () => {
            pl.songIds = pl.songIds.filter((id) => id !== song.id);
            savePersistedState();
            menu.refresh();
            renderCurrentMenu();
          }
        });
      });

      items.push({
        label: '🗑️ Excluir esta Playlist',
        hasArrow: false,
        action: () => {
          deletePlaylistById(pl.id);
          popMenu();
        }
      });

      return items;
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildAddSongsToPlaylistMenu(playlistId) {
    const menu = {
      title: 'Adicionar à Playlist',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      const pl = state.customPlaylists.find((p) => p.id === playlistId);
      if (!pl || !state.songs.length) {
        return [{ label: 'Nenhuma música disponível', hasArrow: false, action: () => popMenu() }];
      }
      return state.songs.map((song) => {
        const included = pl.songIds.includes(song.id);
        return {
          label: `${included ? '✓ ' : '+ '}${song.title}`,
          sub: song.artist,
          hasArrow: false,
          action: () => {
            if (pl.songIds.includes(song.id)) {
              pl.songIds = pl.songIds.filter((id) => id !== song.id);
            } else {
              pl.songIds.push(song.id);
            }
            savePersistedState();
            menu.refresh();
            renderCurrentMenu();
          }
        };
      });
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildSongListMenu(title, songsListOrGetter) {
    const getSongs = typeof songsListOrGetter === 'function'
      ? songsListOrGetter
      : () => songsListOrGetter;
    let localSongs = [...getSongs()];
    const menu = {
      title,
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      localSongs = [...getSongs()];
      if (!localSongs.length) {
        return [{ label: 'Nenhuma música nesta lista', hasArrow: false, action: () => popMenu() }];
      }
      return localSongs.map((song, idx) => ({
        label: song.title,
        sub: song.artist,
        hasArrow: true,
        action: () => playPlaylist(localSongs, idx),
        onEdit: () => openEditSongModal(song.id, 'song'),
        onDelete: () => {
          deleteSongById(song.id);
          menu.refresh();
          renderCurrentMenu();
        }
      }));
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildDeleteSongsMenu() {
    const menu = {
      title: 'Excluir Músicas',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      const userSongsCount = state.songs.filter((s) => !BUILTIN_IDS.has(s.id) && !s.isDemo).length;
      const items = [];
      if (userSongsCount > 0) {
        items.push({
          label: `🗑️ Limpar Carregadas (${userSongsCount})`,
          hasArrow: false,
          action: () => {
            clearLoadedSongs();
            menu.refresh();
            renderCurrentMenu();
          }
        });
      }
      if (!state.songs.length) {
        items.push({ label: 'Nenhuma música na biblioteca', hasArrow: false, action: () => popMenu() });
        return items;
      }
      state.songs.forEach((song) => {
        items.push({
          label: `🗑️ ${song.title}`,
          sub: song.artist,
          hasArrow: false,
          action: () => {
            deleteSongById(song.id);
            menu.refresh();
            renderCurrentMenu();
          }
        });
      });
      return items;
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildVideosMenu() {
    const menu = {
      title: 'Vídeos',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => [
      ...state.videos.map((v) => ({
        label: v.title,
        sub: v.artist || 'Vídeo',
        hasArrow: true,
        action: () => playVideo(v),
        onDelete: () => {
          deleteVideoById(v.id);
          menu.refresh();
          renderCurrentMenu();
        }
      })),
      {
        label: '▶️ + Link do YouTube...',
        hasArrow: false,
        action: () => openOnlineModal('youtube-video')
      },
      {
        label: '📁 + Carregar Vídeo MP4/WebM...',
        hasArrow: false,
        action: () => dom.fileInput.click()
      },
      {
        label: '🗑️ Excluir Vídeos...',
        hasArrow: true,
        action: () => pushMenu(buildDeleteVideosMenu())
      }
    ];
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildDeleteVideosMenu() {
    const menu = {
      title: 'Excluir Vídeos',
      split: false,
      selectedIndex: 0,
      items: []
    };
    const buildItems = () => {
      if (!state.videos.length) {
        return [{ label: 'Nenhum vídeo na biblioteca', hasArrow: false, action: () => popMenu() }];
      }
      return state.videos.map((v) => ({
        label: `🗑️ ${v.title}`,
        sub: v.artist || 'Vídeo',
        hasArrow: false,
        action: () => {
          deleteVideoById(v.id);
          menu.refresh();
          renderCurrentMenu();
        }
      }));
    };
    menu.items = buildItems();
    menu.refresh = () => {
      menu.items = buildItems();
      menu.selectedIndex = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex));
    };
    return menu;
  }

  function buildExtrasMenu() {
    return {
      title: 'Extras',
      split: true,
      selectedIndex: 0,
      items: [
        {
          label: 'Jogos (Brick)',
          previewType: 'game',
          action: () => startBrickGame()
        },
        {
          label: 'Relógio',
          previewType: 'clock',
          action: () => openClockView()
        },
        {
          label: 'Notas',
          previewType: 'notes',
          action: () => {
            pushMenu({
              title: 'Notas',
              split: false,
              selectedIndex: 0,
              items: state.notes.map((n) => ({
                label: n.title,
                action: () => openNoteView(n)
              }))
            });
          }
        }
      ]
    };
  }

  function applyVisualSettings() {
    const lcdScreen = document.getElementById('lcd-screen');
    if (lcdScreen) {
      lcdScreen.classList.toggle('theme-dark', state.theme === 'dark');
      lcdScreen.classList.toggle('touch-disabled', !state.touchScreenEnabled);
    }
    if (state.volumeControlMode === 'device') {
      dom.audioEl.volume = 1;
      dom.videoEl.volume = 1;
      if (ytReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(100);
      }
    } else {
      dom.audioEl.volume = state.volume;
      dom.videoEl.volume = state.volume;
      if (ytReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(Math.round(state.volume * 100));
      }
    }
    updateIpodScale();
  }

  function buildSettingsMenu() {
    return {
      title: 'Configurações',
      split: false,
      selectedIndex: 0,
      items: [
        {
          label: 'Tema',
          getSub: () => (state.theme === 'dark' ? 'Escuro' : 'Claro'),
          hasArrow: false,
          action: () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            applyVisualSettings();
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Fluxo de cobertura',
          getSub: () => (
            state.coverFlowStyle === 'flat'
              ? 'Plano'
              : state.coverFlowStyle === 'carousel'
                ? 'Carrossel'
                : 'Original'
          ),
          hasArrow: false,
          action: () => {
            const order = ['original', 'flat', 'carousel'];
            state.coverFlowStyle = order[(order.indexOf(state.coverFlowStyle) + 1) % order.length];
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Cor do Dispositivo',
          getSub: () => state.skins[state.skinIndex].name,
          hasArrow: false,
          action: () => pushMenu(buildColorMenu())
        },
        {
          label: 'Tamanho da Click Wheel',
          getSub: () => (
            state.wheelSize === 'small'
              ? 'Pequeno'
              : state.wheelSize === 'medium'
                ? 'Médio'
                : 'Grande'
          ),
          hasArrow: false,
          action: () => {
            const order = ['small', 'medium', 'large'];
            state.wheelSize = order[(order.indexOf(state.wheelSize) + 1) % order.length];
            updateIpodScale();
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Sensibilidade da Click Wheel',
          getSub: () => (
            state.wheelSensitivity === 'low'
              ? 'Baixo'
              : state.wheelSensitivity === 'high'
                ? 'Alto'
                : 'Médio'
          ),
          hasArrow: false,
          action: () => {
            const order = ['low', 'medium', 'high'];
            state.wheelSensitivity = order[(order.indexOf(state.wheelSensitivity) + 1) % order.length];
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Ativar Tela de Toque',
          getSub: () => (state.touchScreenEnabled ? 'Ligado' : 'Desligado'),
          hasArrow: false,
          action: () => {
            state.touchScreenEnabled = !state.touchScreenEnabled;
            applyVisualSettings();
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Vibração',
          getSub: () => (state.vibrateEnabled ? 'Ligado' : 'Desligado'),
          hasArrow: false,
          action: () => {
            state.vibrateEnabled = !state.vibrateEnabled;
            if (state.vibrateEnabled) triggerHapticPulse(18);
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Sons da Click Wheel',
          getSub: () => (state.clickSoundEnabled ? 'Ligado' : 'Desligado'),
          hasArrow: false,
          action: () => {
            state.clickSoundEnabled = !state.clickSoundEnabled;
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Modo de Controle de Volume',
          getSub: () => (state.volumeControlMode === 'device' ? 'Dispositivo' : 'App'),
          hasArrow: false,
          action: () => {
            state.volumeControlMode = state.volumeControlMode === 'device' ? 'app' : 'device';
            applyVisualSettings();
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Tela Dividida',
          getSub: () => (state.splitScreenEnabled ? 'Ligado' : 'Desligado'),
          hasArrow: false,
          action: () => {
            state.splitScreenEnabled = !state.splitScreenEnabled;
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Aleatório',
          getSub: () => (state.shuffle ? 'Músicas' : 'Desligado'),
          hasArrow: false,
          action: () => {
            state.shuffle = !state.shuffle;
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Repetir',
          getSub: () => (state.repeat === 'off' ? 'Desligado' : state.repeat === 'one' ? 'Uma' : 'Todas'),
          hasArrow: false,
          action: () => {
            const order = ['off', 'all', 'one'];
            state.repeat = order[(order.indexOf(state.repeat) + 1) % order.length];
            savePersistedState();
            renderCurrentMenu();
          }
        },
        {
          label: 'Tela Cheia',
          getSub: () => (document.fullscreenElement ? 'Ativo' : 'Desligado'),
          hasArrow: false,
          action: () => toggleFullscreen()
        },
        {
          label: 'Instalar App',
          getSub: () => (deferredInstallPrompt ? 'Pronto' : 'PWA'),
          hasArrow: false,
          action: () => installPwaApp()
        },
        {
          label: '💾 Salvar Backup (Arquivo)',
          hasArrow: false,
          action: () => exportLibraryBackupFile()
        },
        {
          label: '📥 Carregar Backup (Arquivo)',
          hasArrow: false,
          action: () => dom.backupInput && dom.backupInput.click()
        },
        {
          label: 'Restaurar Biblioteca',
          getSub: () => (state.deletedBuiltinIds.length ? `${state.deletedBuiltinIds.length} removidas` : 'OK'),
          hasArrow: false,
          action: () => restoreDefaultLibrary()
        },
        {
          label: 'Sobre',
          hasArrow: true,
          action: () => openAboutView()
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // 6. GERENCIAMENTO DE NAVEGAÇÃO E TELAS + PROXY/FALLBACK YOUTUBE
  // --------------------------------------------------------------------------
  let ytPlayer = null;
  let ytReady = false;
  let ytProgressTimer = null;
  let activeYoutubeMode = null; // null | 'video' | 'song'
  let pendingIframeAttach = null;
  let proxyApiBase = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? ''
    : 'http://localhost:3456';
  let proxyServerAvailable = false;
  let proxyChecked = false;
  let proxyCheckPromise = null;

  async function checkProxyServer() {
    if (proxyChecked) return proxyServerAvailable;
    if (proxyCheckPromise) return proxyCheckPromise;

    proxyCheckPromise = (async () => {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 800) : null;
      try {
        const res = await fetch(`${proxyApiBase}/api/health`, {
          signal: controller ? controller.signal : undefined,
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok) {
            proxyServerAvailable = true;
            return true;
          }
        }
      } catch (_) {
        // Hospedagem estática (GitHub Pages / Hostinger) ou servidor local indisponível
      } finally {
        if (timer) clearTimeout(timer);
        proxyChecked = true;
        proxyCheckPromise = null;
      }
      proxyServerAvailable = false;
      return false;
    })();

    return proxyCheckPromise;
  }

  function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  function ensureYouTubeApiScript(onReadyCallback) {
    if (window.YT && window.YT.Player) {
      onReadyCallback();
      return;
    }
    pendingIframeAttach = onReadyCallback;
    if (document.getElementById('yt-iframe-api-script')) return;
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      if (typeof pendingIframeAttach === 'function') {
        const cb = pendingIframeAttach;
        pendingIframeAttach = null;
        cb();
      }
    };
  }

  function removeSongIframeFallback() {
    const existing = document.getElementById('np-yt-fallback');
    if (existing) existing.remove();
    dom.npArtwork.classList.remove('hidden');
    dom.npArtworkReflection.classList.remove('hidden');
  }

  function loadYouTubeIframeFallback(videoId, mode) {
    stopYouTubePlayback();
    activeYoutubeMode = mode;

    const params = new URLSearchParams({
      autoplay: '1',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1',
      controls: mode === 'video' ? '1' : '0'
    });
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      params.set('origin', window.location.origin);
      params.set('widget_referrer', window.location.href);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'yt-player-frame';
    iframe.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    if (mode === 'song') {
      const wrap = document.querySelector('.np-artwork-wrap');
      if (wrap) {
        const fallbackBox = document.createElement('div');
        fallbackBox.id = 'np-yt-fallback';
        fallbackBox.className = 'np-yt-fallback';
        fallbackBox.appendChild(iframe);
        wrap.appendChild(fallbackBox);
      }
    } else {
      dom.videoEl.pause();
      dom.videoEl.classList.add('hidden');
      dom.ytPlayerWrap.innerHTML = '';
      dom.ytPlayerWrap.appendChild(iframe);
      dom.ytPlayerWrap.classList.remove('hidden');
    }

    const attachApi = () => {
      if (!document.getElementById('yt-player-frame')) return;
      try {
        ytPlayer = new window.YT.Player('yt-player-frame', {
          events: {
            onReady: (e) => {
              ytReady = true;
              try {
                e.target.setVolume(Math.round(state.volume * 100));
                e.target.playVideo();
              } catch (_) {}
              startYtProgressLoop();
              updateStatusPlayIcon();
            },
            onError: (e) => {
              const code = e && e.data;
              if (activeYoutubeMode === 'song') {
                dom.npAlbum.textContent = code === 150 || code === 101
                  ? 'Embed bloqueado - abra via .bat'
                  : `Erro YouTube (${code})`;
              } else if (activeYoutubeMode === 'video') {
                dom.videoTitle.textContent = code === 150 || code === 101
                  ? 'Embed bloqueado - abra via .bat'
                  : `Erro YouTube (${code})`;
                pokeVideoHud();
              }
            },
            onStateChange: (e) => {
              updateStatusPlayIcon();
              if (e.data === window.YT.PlayerState.ENDED && activeYoutubeMode === 'song') {
                if (state.repeat === 'one') {
                  ytPlayer.seekTo(0, true);
                  ytPlayer.playVideo();
                } else {
                  nextTrack();
                }
              }
            }
          }
        });
      } catch (_) {}
    };

    ensureYouTubeApiScript(attachApi);
    updateStatusPlayIcon();
  }

  function startYtProgressLoop() {
    clearInterval(ytProgressTimer);
    ytProgressTimer = setInterval(() => {
      if (!ytReady || !ytPlayer || !activeYoutubeMode) return;
      if (typeof ytPlayer.getCurrentTime !== 'function') return;

      const cur = ytPlayer.getCurrentTime() || 0;
      const dur = ytPlayer.getDuration() || 0;
      const pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;

      if (activeYoutubeMode === 'song') {
        dom.npCurrentTime.textContent = formatTime(cur);
        dom.npRemainingTime.textContent = `-${formatTime(Math.max(0, dur - cur))}`;
        dom.npProgressFill.style.width = `${pct}%`;
        dom.npScrubberDiamond.style.left = `${pct}%`;
      } else if (activeYoutubeMode === 'video') {
        dom.vidCurrentTime.textContent = formatTime(cur);
        dom.vidRemainingTime.textContent = `-${formatTime(Math.max(0, dur - cur))}`;
        dom.vidProgressFill.style.width = `${pct}%`;
      }
    }, 300);
  }

  function stopYouTubePlayback() {
    activeYoutubeMode = null;
    pendingIframeAttach = null;
    clearInterval(ytProgressTimer);
    ytProgressTimer = null;
    if (ytPlayer) {
      try {
        if (typeof ytPlayer.stopVideo === 'function') ytPlayer.stopVideo();
        if (typeof ytPlayer.destroy === 'function') ytPlayer.destroy();
      } catch (_) {}
      ytPlayer = null;
    }
    ytReady = false;
    dom.ytPlayerWrap.innerHTML = '<div id="yt-player-frame"></div>';
    dom.ytPlayerWrap.classList.add('hidden');
    removeSongIframeFallback();
  }

  function isYouTubePlaying() {
    if (!ytReady || !ytPlayer || !activeYoutubeMode || typeof ytPlayer.getPlayerState !== 'function') return false;
    return ytPlayer.getPlayerState() === 1; // YT.PlayerState.PLAYING
  }

  function showView(viewName, titleText) {
    // Pausar jogo se sair dele
    if (state.currentView === 'game' && viewName !== 'game') {
      stopBrickGame();
    }
    if (state.currentView === 'video' && viewName !== 'video') {
      const wasSync = dom.videoEl.dataset.ytAudioSync === '1';
      delete dom.videoEl.dataset.ytAudioSync;
      delete dom.videoEl.dataset.ytFallbackId;
      dom.videoEl.pause();
      dom.videoEl.removeAttribute('src');
      dom.videoEl.load();
      if (wasSync) {
        dom.audioEl.pause();
        dom.audioEl.removeAttribute('src');
      }
      if (activeYoutubeMode === 'video') {
        stopYouTubePlayback();
      }
      updateStatusPlayIcon();
    }

    state.currentView = viewName;
    if (titleText) {
      dom.statusTitle.textContent = titleText;
    }

    const views = {
      'split': dom.viewSplit,
      'full': dom.viewFullList,
      'now-playing': dom.viewNowPlaying,
      'coverflow': dom.viewCoverflow,
      'video': dom.viewVideo,
      'photos': dom.viewPhotos,
      'game': dom.viewGame,
      'extra': dom.viewExtra
    };

    Object.entries(views).forEach(([key, el]) => {
      if (key === viewName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }

  function currentMenu() {
    return state.navStack[state.navStack.length - 1];
  }

  function pushMenu(menuObj) {
    state.navStack.push(menuObj);
    renderCurrentMenu();
  }

  function popMenu() {
    if (state.currentView === 'photos' && state.photoViewerOpen) {
      closePhotoFullViewer();
      return;
    }

    if (state.currentView !== 'split' && state.currentView !== 'full') {
      const m = currentMenu();
      if (m && typeof m.refresh === 'function') m.refresh();
      renderCurrentMenu();
      return;
    }

    if (state.navStack.length > 1) {
      state.navStack.pop();
      const m = currentMenu();
      if (m && typeof m.refresh === 'function') m.refresh();
      renderCurrentMenu();
    }
  }

  function refreshAllMenusInStack() {
    state.navStack.forEach((m) => {
      if (m && typeof m.refresh === 'function') m.refresh();
    });
    if (state.currentView === 'split' || state.currentView === 'full') {
      renderCurrentMenu();
    } else if (state.currentView === 'coverflow') {
      state.coverFlowAlbums = getUniqueAlbums();
      state.coverFlowIndex = Math.max(0, Math.min(state.coverFlowAlbums.length - 1, state.coverFlowIndex));
      renderCoverFlow();
    }
  }

  function renderCurrentMenu() {
    const menu = currentMenu();
    if (!menu) return;

    const useSplit = Boolean(menu.split && state.splitScreenEnabled);
    showView(useSplit ? 'split' : 'full', menu.title);
    const listEl = useSplit ? dom.menuList : dom.fullMenuList;
    listEl.innerHTML = '';

    menu.items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'menu-item' + (idx === menu.selectedIndex ? ' selected' : '');

      if (item.colorDot) {
        const dotSpan = document.createElement('span');
        dotSpan.className = 'menu-color-dot';
        dotSpan.style.background = item.colorDot;
        li.appendChild(dotSpan);
      }

      const labelSpan = document.createElement('span');
      labelSpan.className = 'menu-item-label';
      labelSpan.textContent = item.label;
      li.appendChild(labelSpan);

      const subText = item.getSub ? item.getSub() : item.sub;
      if (subText) {
        const subSpan = document.createElement('span');
        subSpan.className = 'menu-item-sub';
        subSpan.textContent = subText;
        li.appendChild(subSpan);
      } else if (item.hasArrow !== false) {
        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'menu-item-arrow';
        arrowSpan.textContent = '›';
        li.appendChild(arrowSpan);
      }

      if (typeof item.onEdit === 'function') {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'menu-item-edit';
        editBtn.textContent = '✎';
        editBtn.title = 'Editar / Trocar Capa';
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.locked) return;
          playWheelClick();
          item.onEdit();
        });
        li.appendChild(editBtn);
      }

      if (typeof item.onDelete === 'function') {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'menu-item-delete';
        delBtn.textContent = '✕';
        delBtn.title = 'Excluir';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.locked) return;
          playWheelClick();
          item.onDelete();
        });
        li.appendChild(delBtn);
      }

      li.addEventListener('click', () => {
        if (state.locked) return;
        menu.selectedIndex = idx;
        playWheelClick();
        renderCurrentMenu();
        item.action();
      });

      listEl.appendChild(li);
    });

    // Garantir que o item selecionado esteja visível na rolagem
    const selectedEl = listEl.children[menu.selectedIndex];
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }

    if (useSplit) {
      renderSplitPreview(menu.items[menu.selectedIndex]);
    }
  }

  function renderSplitPreview(item) {
    if (!item) return;
    const type = item.previewType || 'music';
    const currentSong = state.playlist[state.currentTrackIndex] || state.songs[0];

    if (type === 'music' || type === 'coverflow' || type === 'nowplaying' || type === 'shuffle') {
      const cover = currentSong ? currentSong.cover : jackCover;
      const caption = currentSong ? `${currentSong.artist}` : 'Biblioteca';
      dom.splitPreview.innerHTML = `
        <div class="preview-card">
          <div class="preview-cover-stack">
            <img src="${cover}" alt="Preview">
            <img src="${cover}" alt="" class="preview-reflection">
          </div>
          <div class="preview-label">${caption}</div>
        </div>
      `;
    } else if (type === 'videos') {
      const vidCover = state.videos[0] ? state.videos[0].cover : jackCover;
      dom.splitPreview.innerHTML = `
        <div class="preview-card">
          <div class="preview-cover-stack">
            <img src="${vidCover}" alt="Vídeos">
            <img src="${vidCover}" alt="" class="preview-reflection">
          </div>
          <div class="preview-label">${state.videos.length} vídeos</div>
        </div>
      `;
    } else if (type === 'photos') {
      const phCover = state.photos[0] ? state.photos[0].url : jackCover;
      dom.splitPreview.innerHTML = `
        <div class="preview-card">
          <div class="preview-cover-stack">
            <img src="${phCover}" alt="Fotos">
            <img src="${phCover}" alt="" class="preview-reflection">
          </div>
          <div class="preview-label">${state.photos.length} fotos</div>
        </div>
      `;
    } else if (type === 'color') {
      const currentSkin = state.skins[state.skinIndex];
      dom.splitPreview.innerHTML = `
        <div class="preview-card">
          <div class="preview-icon-box" style="background:${currentSkin.hex};border:2px solid rgba(0,0,0,0.2);">🎨</div>
          <div class="preview-label">Cor: ${currentSkin.name}</div>
        </div>
      `;
    } else if (type === 'import') {
      dom.splitPreview.innerHTML = `
        <div class="preview-card">
          <div class="preview-icon-box">▶️</div>
          <div class="preview-label">YouTube / PC</div>
        </div>
      `;
    } else {
      const iconMap = {
        extras: '🕹️',
        settings: '⚙️',
        game: '🧱',
        clock: '🕒',
        notes: '📝',
        fullscreen: '⛶',
        install: '📲'
      };
      dom.splitPreview.innerHTML = `
        <div class="preview-card">
          <div class="preview-icon-box">${iconMap[type] || ''}</div>
          <div class="preview-label">${item.label}</div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // 7. REPRODUTOR DE MÚSICA E TELA "NOW PLAYING" (IDÊNTICA À FOTO!)
  // --------------------------------------------------------------------------
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function playPlaylist(songsArray, startIndex = 0) {
    if (!songsArray || !songsArray.length) return;
    state.playlist = [...songsArray];
    state.currentTrackIndex = startIndex;
    loadAndPlayCurrentTrack();
    showView('now-playing', 'Reproduzindo Agora');
  }

  function startShuffleAll() {
    if (!state.songs.length) return;
    state.shuffle = true;
    const shuffled = [...state.songs].sort(() => Math.random() - 0.5);
    playPlaylist(shuffled, 0);
  }

  async function loadAndPlayCurrentTrack() {
    const track = state.playlist[state.currentTrackIndex];
    if (!track) return;

    delete dom.videoEl.dataset.ytAudioSync;
    dom.videoEl.pause();
    stopYouTubePlayback();
    delete dom.audioEl.dataset.ytFallbackId;

    state.npMode = 'volume';
    updateNowPlayingUI();

    // Verifica se a música da playlist é um link do YouTube
    if (track.youtubeId) {
      dom.audioEl.pause();
      dom.audioEl.removeAttribute('src');
      dom.npCurrentTime.textContent = '0:00';
      dom.npRemainingTime.textContent = '-0:00';
      dom.npProgressFill.style.width = '0%';

      const startYouTubeSong = (hasProxy) => {
        if (state.playlist[state.currentTrackIndex] !== track) return;
        if (hasProxy) {
          dom.npAlbum.textContent = 'Carregando YouTube...';
          dom.audioEl.dataset.ytFallbackId = track.youtubeId;
          dom.audioEl.src = `${proxyApiBase}/api/yt-stream?id=${encodeURIComponent(track.youtubeId)}&type=audio`;
          dom.audioEl.volume = state.volume;
          dom.audioEl.play().then(() => {
            state.isPlaying = true;
            dom.npAlbum.textContent = track.album || 'YouTube';
            updateStatusPlayIcon();
          }).catch(() => {
            state.isPlaying = false;
            updateStatusPlayIcon();
          });
        } else {
          dom.npAlbum.textContent = track.album || 'YouTube';
          loadYouTubeIframeFallback(track.youtubeId, 'song');
        }
      };

      // Caminho síncrono preserva o gesto de toque no celular (autoplay)
      if (proxyChecked) {
        startYouTubeSong(proxyServerAvailable);
      } else {
        dom.npAlbum.textContent = 'Carregando YouTube...';
        const hasProxy = await checkProxyServer();
        startYouTubeSong(hasProxy);
      }
      return;
    }

    // Caso contrário, é áudio HTML5 normal (MP3, WAV, etc.)
    dom.audioEl.src = track.url;
    dom.audioEl.volume = state.volume;
    dom.audioEl.play().then(() => {
      state.isPlaying = true;
      updateStatusPlayIcon();
    }).catch(() => {
      state.isPlaying = false;
      updateStatusPlayIcon();
    });
  }

  function setNowPlayingMarqueeTitle(rawTitle) {
    const text = rawTitle || 'Sem Título';
    dom.npTitle.innerHTML = '';
    if (text.length > 12) {
      dom.npTitle.classList.add('marquee');
      const s1 = document.createElement('span');
      s1.textContent = text;
      const spacer = document.createElement('span');
      spacer.className = 'np-title-spacer';
      const s2 = document.createElement('span');
      s2.textContent = text;
      dom.npTitle.appendChild(s1);
      dom.npTitle.appendChild(spacer);
      dom.npTitle.appendChild(s2);
    } else {
      dom.npTitle.classList.remove('marquee');
      dom.npTitle.textContent = text;
    }
  }

  function updateNowPlayingUI() {
    const track = state.playlist[state.currentTrackIndex] || state.songs[0];
    if (!track) {
      dom.npArtwork.src = jackCover;
      dom.npArtworkReflection.src = jackCover;
      setNowPlayingMarqueeTitle('Sem Músicas');
      dom.npArtist.textContent = 'Adicione músicas ou links';
      dom.npAlbum.textContent = 'iPod Classic';
      dom.npRating.textContent = '☆☆☆☆☆';
      dom.npTrackIndex.textContent = '0 de 0';
      dom.npShuffleBadge.textContent = '';
      dom.npRepeatBadge.textContent = '';
      if (dom.npEditBtn) dom.npEditBtn.classList.add('hidden');
      if (dom.npDeleteBtn) dom.npDeleteBtn.classList.add('hidden');
      return;
    }

    if (dom.npEditBtn) dom.npEditBtn.classList.remove('hidden');
    if (dom.npDeleteBtn) dom.npDeleteBtn.classList.remove('hidden');

    const coverUrl = track.cover || jackCover;
    dom.npArtwork.src = coverUrl;
    dom.npArtworkReflection.src = coverUrl;
    setNowPlayingMarqueeTitle(track.title || 'Sem Título');
    dom.npArtist.textContent = track.artist || 'Artista Desconhecido';
    dom.npAlbum.textContent = track.album || 'iPod Classic';

    const stars = Math.max(0, Math.min(5, track.rating || 5));
    dom.npRating.textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    dom.npRating.classList.toggle('editing', state.npMode === 'rating');

    const total = state.playlist.length || state.songs.length;
    dom.npTrackIndex.textContent = `${state.currentTrackIndex + 1} de ${total}`;

    dom.npShuffleBadge.textContent = state.shuffle ? '🔀 Shuffle' : '';
    dom.npRepeatBadge.textContent = state.repeat !== 'off' ? `🔁 ${state.repeat === 'one' ? '1' : 'All'}` : '';

    dom.npScrubberDiamond.classList.toggle('hidden', state.npMode !== 'scrub');
    dom.npVolumeFill.style.width = `${Math.round(state.volume * 100)}%`;
  }

  if (dom.npEditBtn) {
    dom.npEditBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.locked) return;
      const track = state.playlist[state.currentTrackIndex] || state.songs[0];
      if (!track) return;
      playWheelClick();
      openEditSongModal(track.id, 'song');
    });
  }

  if (dom.npArtwork) {
    dom.npArtwork.style.cursor = 'pointer';
    dom.npArtwork.title = 'Clique para trocar a capa (thumb) ou editar a música';
    dom.npArtwork.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.locked) return;
      const track = state.playlist[state.currentTrackIndex] || state.songs[0];
      if (!track) return;
      playWheelClick();
      openEditSongModal(track.id, 'song');
    });
  }

  if (dom.npDeleteBtn) {
    dom.npDeleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.locked) return;
      const track = state.playlist[state.currentTrackIndex] || state.songs[0];
      if (!track) return;
      playWheelClick();
      deleteSongById(track.id);
    });
  }

  function updateStatusPlayIcon() {
    dom.statusPlayIcon.className = 'play-state-icon';
    const ytPlaying = isYouTubePlaying();
    const mediaPlaying = ytPlaying || !dom.audioEl.paused || (!dom.videoEl.paused && state.currentView === 'video');
    if (mediaPlaying) {
      dom.statusPlayIcon.classList.add('playing');
    } else if (dom.audioEl.src || activeYoutubeMode) {
      dom.statusPlayIcon.classList.add('paused');
    }
  }

  dom.audioEl.addEventListener('timeupdate', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') return;
    const cur = dom.audioEl.currentTime || 0;
    const dur = dom.audioEl.duration || 0;
    const pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;

    dom.npCurrentTime.textContent = formatTime(cur);
    dom.npRemainingTime.textContent = `-${formatTime(Math.max(0, dur - cur))}`;
    dom.npProgressFill.style.width = `${pct}%`;
    dom.npScrubberDiamond.style.left = `${pct}%`;
  });

  dom.audioEl.addEventListener('loadedmetadata', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') return;
    const track = state.playlist[state.currentTrackIndex];
    if (track && track.youtubeId) {
      dom.npAlbum.textContent = track.album || 'YouTube';
    }
  });

  dom.audioEl.addEventListener('playing', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') return;
    const track = state.playlist[state.currentTrackIndex];
    if (track && track.youtubeId) {
      dom.npAlbum.textContent = track.album || 'YouTube';
    }
    updateStatusPlayIcon();
  });

  dom.audioEl.addEventListener('error', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') return;
    const fallbackYtId = dom.audioEl.dataset.ytFallbackId;
    const track = state.playlist[state.currentTrackIndex];
    if (fallbackYtId && track && track.youtubeId === fallbackYtId) {
      delete dom.audioEl.dataset.ytFallbackId;
      dom.npAlbum.textContent = track.album || 'YouTube';
      loadYouTubeIframeFallback(fallbackYtId, 'song');
    }
  });

  dom.audioEl.addEventListener('ended', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') return;
    if (state.repeat === 'one') {
      dom.audioEl.currentTime = 0;
      dom.audioEl.play();
    } else {
      nextTrack();
    }
  });

  dom.audioEl.addEventListener('play', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') return;
    updateStatusPlayIcon();
  });
  dom.audioEl.addEventListener('pause', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') return;
    updateStatusPlayIcon();
  });

  // Clique direto na barra de progresso para pular para o ponto da música
  dom.npProgressContainer.addEventListener('click', (e) => {
    const rect = dom.npProgressContainer.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (activeYoutubeMode === 'song' && ytReady && ytPlayer && typeof ytPlayer.getDuration === 'function') {
      const dur = ytPlayer.getDuration();
      if (dur > 0) ytPlayer.seekTo(ratio * dur, true);
      return;
    }
    if (!dom.audioEl.duration) return;
    dom.audioEl.currentTime = ratio * dom.audioEl.duration;
  });

  function togglePlayPause() {
    if (state.locked) return;
    playWheelClick();

    if (state.currentView === 'game') {
      toggleBrickPause();
      return;
    }

    // Se estiver assistindo ou ouvindo um link do YouTube
    if (activeYoutubeMode && ytReady && ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
      if (ytPlayer.getPlayerState() === 1) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
      if (state.currentView === 'video') pokeVideoHud();
      updateStatusPlayIcon();
      return;
    }

    if (state.currentView === 'video') {
      if (dom.videoEl.paused) {
        dom.videoEl.play();
      } else {
        dom.videoEl.pause();
      }
      updateStatusPlayIcon();
      return;
    }

    if (!state.playlist.length) {
      state.playlist = [...state.songs];
      state.currentTrackIndex = 0;
      loadAndPlayCurrentTrack();
      return;
    }

    if (!dom.audioEl.src) {
      loadAndPlayCurrentTrack();
      return;
    }

    if (dom.audioEl.paused) {
      dom.audioEl.play();
    } else {
      dom.audioEl.pause();
    }
    updateStatusPlayIcon();
  }

  function nextTrack() {
    if (state.locked) return;
    if (state.currentView === 'game') {
      moveBrickPaddle(1);
      return;
    }
    if (state.currentView === 'photos') {
      stepPhoto(1);
      return;
    }
    if (state.currentView === 'coverflow') {
      stepCoverFlow(1);
      return;
    }
    if (!state.playlist.length) state.playlist = [...state.songs];
    if (!state.playlist.length) return;

    if (state.currentTrackIndex < state.playlist.length - 1) {
      state.currentTrackIndex++;
      loadAndPlayCurrentTrack();
    } else if (state.repeat === 'all') {
      state.currentTrackIndex = 0;
      loadAndPlayCurrentTrack();
    }
  }

  function prevTrack() {
    if (state.locked) return;
    if (state.currentView === 'game') {
      moveBrickPaddle(-1);
      return;
    }
    if (state.currentView === 'photos') {
      stepPhoto(-1);
      return;
    }
    if (state.currentView === 'coverflow') {
      stepCoverFlow(-1);
      return;
    }
    if (activeYoutubeMode === 'song' && ytReady && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
      if (ytPlayer.getCurrentTime() > 3) {
        ytPlayer.seekTo(0, true);
        return;
      }
    } else if (dom.audioEl.currentTime > 3) {
      dom.audioEl.currentTime = 0;
      return;
    }
    if (!state.playlist.length) state.playlist = [...state.songs];
    if (state.currentTrackIndex > 0) {
      state.currentTrackIndex--;
      loadAndPlayCurrentTrack();
    }
  }

  // Alternar modos do botão central no Now Playing (Volume -> Scrubber -> Estrelas)
  function cycleNowPlayingCenterMode() {
    const order = ['volume', 'scrub', 'rating'];
    state.npMode = order[(order.indexOf(state.npMode) + 1) % order.length];
    dom.npTimeRow.classList.remove('hidden');
    dom.npVolumeRow.classList.add('hidden');
    updateNowPlayingUI();
  }

  function showTemporaryVolumeBar() {
    dom.npTimeRow.classList.add('hidden');
    dom.npVolumeRow.classList.remove('hidden');
    dom.npVolumeFill.style.width = `${Math.round(state.volume * 100)}%`;

    clearTimeout(state.npModeTimeout);
    state.npModeTimeout = setTimeout(() => {
      dom.npVolumeRow.classList.add('hidden');
      dom.npTimeRow.classList.remove('hidden');
    }, 1600);
  }

  // --------------------------------------------------------------------------
  // 8. COVER FLOW 3D INTERATIVO
  // --------------------------------------------------------------------------
  function openCoverFlowView() {
    state.coverFlowAlbums = getUniqueAlbums();
    state.coverFlowIndex = 0;
    showView('coverflow', 'Cover Flow');
    renderCoverFlow();
  }

  function renderCoverFlow() {
    const albums = state.coverFlowAlbums;
    dom.cfStage.innerHTML = '';
    if (!albums.length) return;

    albums.forEach((al, idx) => {
      const offset = idx - state.coverFlowIndex;
      const card = document.createElement('div');
      card.className = 'cf-card';

      let tx = offset * 44;
      let tz = -Math.abs(offset) * 55;
      let ry = 0;

      if (state.coverFlowStyle === 'flat') {
        tx = offset * 104;
        tz = offset === 0 ? 22 : -22;
        ry = 0;
      } else if (state.coverFlowStyle === 'carousel') {
        tx = offset * 62;
        tz = -Math.abs(offset) * 40;
        ry = -offset * 24;
      } else {
        if (offset < 0) {
          tx -= 30;
          ry = 58;
        } else if (offset > 0) {
          tx += 30;
          ry = -58;
        } else {
          tz = 35;
        }
      }

      card.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`;
      card.style.zIndex = String(100 - Math.abs(offset));
      card.style.opacity = Math.abs(offset) > 4 ? '0' : '1';

      card.innerHTML = `<img src="${al.cover}" alt="${al.album}">`;
      card.addEventListener('click', () => {
        if (idx === state.coverFlowIndex) {
          playPlaylist(al.songs, 0);
        } else {
          state.coverFlowIndex = idx;
          playWheelClick();
          renderCoverFlow();
        }
      });

      dom.cfStage.appendChild(card);
    });

    const currentAlbum = albums[state.coverFlowIndex];
    if (currentAlbum) {
      dom.cfAlbumTitle.textContent = currentAlbum.album;
      dom.cfAlbumArtist.textContent = currentAlbum.artist;
    }
  }

  function stepCoverFlow(dir) {
    const max = state.coverFlowAlbums.length - 1;
    const next = Math.max(0, Math.min(max, state.coverFlowIndex + dir));
    if (next !== state.coverFlowIndex) {
      state.coverFlowIndex = next;
      renderCoverFlow();
    }
  }

  // --------------------------------------------------------------------------
  // 9. PLAYER DE VÍDEO MP4 / WEBM & YOUTUBE
  // --------------------------------------------------------------------------
  let videoHudTimer = null;

  async function playVideo(videoObj) {
    dom.audioEl.pause();
    stopYouTubePlayback();
    delete dom.videoEl.dataset.ytAudioSync;
    delete dom.videoEl.dataset.ytFallbackId;
    delete dom.videoEl.dataset.realTitle;

    showView('video', 'Vídeo');
    dom.videoTitle.textContent = videoObj.title;
    dom.vidCurrentTime.textContent = '0:00';
    dom.vidRemainingTime.textContent = '-0:00';
    dom.vidProgressFill.style.width = '0%';

    // Verifica se o vídeo é do YouTube
    const ytId = videoObj.youtubeId || extractYouTubeId(videoObj.url);
    if (ytId) {
      dom.videoEl.classList.remove('hidden');
      dom.ytPlayerWrap.classList.add('hidden');
      dom.videoHud.classList.remove('fade-out');
      clearTimeout(videoHudTimer);

      const startYouTubeVideo = (hasProxy) => {
        if (state.currentView !== 'video') return;
        if (hasProxy) {
          dom.videoTitle.textContent = 'Carregando YouTube...';
          dom.videoEl.dataset.ytAudioSync = '1';
          dom.videoEl.dataset.ytFallbackId = ytId;
          dom.videoEl.dataset.realTitle = videoObj.title;
          dom.videoEl.src = `${proxyApiBase}/api/yt-stream?id=${encodeURIComponent(ytId)}&type=video`;
          dom.audioEl.src = `${proxyApiBase}/api/yt-stream?id=${encodeURIComponent(ytId)}&type=audio`;
          dom.videoEl.volume = state.volume;
          dom.audioEl.volume = state.volume;
          dom.videoEl.play().then(() => {
            dom.videoTitle.textContent = videoObj.title;
            pokeVideoHud();
            updateStatusPlayIcon();
          }).catch(() => {
            updateStatusPlayIcon();
          });
          dom.audioEl.play().catch(() => {});
        } else {
          dom.videoTitle.textContent = videoObj.title;
          loadYouTubeIframeFallback(ytId, 'video');
          pokeVideoHud();
        }
      };

      // Caminho síncrono preserva o gesto de toque no celular (autoplay)
      if (proxyChecked) {
        startYouTubeVideo(proxyServerAvailable);
      } else {
        dom.videoTitle.textContent = 'Carregando YouTube...';
        const hasProxy = await checkProxyServer();
        startYouTubeVideo(hasProxy);
      }
      return;
    }

    // Caso contrário, vídeo MP4/WebM tradicional
    dom.ytPlayerWrap.classList.add('hidden');
    dom.videoEl.classList.remove('hidden');
    dom.videoEl.src = videoObj.url;
    dom.videoEl.volume = state.volume;
    dom.videoEl.play().catch(() => {});
    pokeVideoHud();
    updateStatusPlayIcon();
  }

  function pokeVideoHud() {
    dom.videoHud.classList.remove('fade-out');
    clearTimeout(videoHudTimer);
    videoHudTimer = setTimeout(() => {
      const playing = activeYoutubeMode === 'video' ? isYouTubePlaying() : !dom.videoEl.paused;
      if (playing) {
        dom.videoHud.classList.add('fade-out');
      }
    }, 2800);
  }

  dom.videoEl.addEventListener('timeupdate', () => {
    if (activeYoutubeMode) return;
    if (dom.videoEl.dataset.ytAudioSync === '1' && !dom.videoEl.paused && Math.abs(dom.videoEl.currentTime - dom.audioEl.currentTime) > 0.4) {
      dom.audioEl.currentTime = dom.videoEl.currentTime;
    }
    const cur = dom.videoEl.currentTime || 0;
    const dur = dom.videoEl.duration || 0;
    const pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0;
    dom.vidCurrentTime.textContent = formatTime(cur);
    dom.vidRemainingTime.textContent = `-${formatTime(Math.max(0, dur - cur))}`;
    dom.vidProgressFill.style.width = `${pct}%`;
  });

  dom.videoEl.addEventListener('loadedmetadata', () => {
    if (dom.videoEl.dataset.realTitle) {
      dom.videoTitle.textContent = dom.videoEl.dataset.realTitle;
    }
  });

  dom.videoEl.addEventListener('playing', () => {
    if (dom.videoEl.dataset.realTitle) {
      dom.videoTitle.textContent = dom.videoEl.dataset.realTitle;
    }
    if (dom.videoEl.dataset.ytAudioSync === '1') {
      if (Math.abs(dom.videoEl.currentTime - dom.audioEl.currentTime) > 0.3) {
        dom.audioEl.currentTime = dom.videoEl.currentTime;
      }
      dom.audioEl.play().catch(() => {});
    }
    pokeVideoHud();
    updateStatusPlayIcon();
  });

  dom.videoEl.addEventListener('play', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') {
      if (Math.abs(dom.videoEl.currentTime - dom.audioEl.currentTime) > 0.3) {
        dom.audioEl.currentTime = dom.videoEl.currentTime;
      }
      dom.audioEl.play().catch(() => {});
    }
    updateStatusPlayIcon();
  });

  dom.videoEl.addEventListener('pause', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') {
      dom.audioEl.pause();
    }
    updateStatusPlayIcon();
  });

  dom.videoEl.addEventListener('waiting', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') {
      dom.audioEl.pause();
    }
  });

  dom.videoEl.addEventListener('ended', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') {
      dom.audioEl.pause();
    }
    updateStatusPlayIcon();
  });

  dom.videoEl.addEventListener('seeked', () => {
    if (dom.videoEl.dataset.ytAudioSync === '1') {
      dom.audioEl.currentTime = dom.videoEl.currentTime;
    }
  });

  dom.videoEl.addEventListener('error', () => {
    const fallbackYtId = dom.videoEl.dataset.ytFallbackId;
    if (fallbackYtId && state.currentView === 'video') {
      const title = dom.videoEl.dataset.realTitle || `YouTube (${fallbackYtId})`;
      delete dom.videoEl.dataset.ytFallbackId;
      delete dom.videoEl.dataset.ytAudioSync;
      dom.audioEl.pause();
      dom.audioEl.removeAttribute('src');
      dom.videoTitle.textContent = title;
      loadYouTubeIframeFallback(fallbackYtId, 'video');
      pokeVideoHud();
    }
  });

  if (dom.vidProgressContainer) {
    dom.vidProgressContainer.addEventListener('click', (e) => {
      const rect = dom.vidProgressContainer.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (activeYoutubeMode === 'video' && ytReady && ytPlayer && typeof ytPlayer.getDuration === 'function') {
        const dur = ytPlayer.getDuration();
        if (dur > 0) ytPlayer.seekTo(ratio * dur, true);
      } else if (dom.videoEl.duration) {
        dom.videoEl.currentTime = ratio * dom.videoEl.duration;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10. CENTRAL DE FOTOS (GRADE + VISUALIZADOR)
  // --------------------------------------------------------------------------
  function openPhotosView() {
    state.photoIndex = 0;
    state.photoViewerOpen = false;
    dom.photoViewer.classList.add('hidden');
    showView('photos', 'Fotos');
    renderPhotoGrid();
  }

  function renderPhotoGrid() {
    dom.photoGrid.innerHTML = '';
    state.photos.forEach((ph, idx) => {
      const img = document.createElement('img');
      img.src = ph.url;
      img.alt = ph.title;
      img.className = 'photo-thumb' + (idx === state.photoIndex ? ' selected' : '');
      img.addEventListener('click', () => {
        state.photoIndex = idx;
        openPhotoFullViewer();
      });
      dom.photoGrid.appendChild(img);
    });

    const activeThumb = dom.photoGrid.children[state.photoIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({ block: 'nearest' });
    }
  }

  function openPhotoFullViewer() {
    const ph = state.photos[state.photoIndex];
    if (!ph) return;
    state.photoViewerOpen = true;
    dom.photoViewer.classList.remove('hidden');
    dom.photoFullImg.src = ph.url;
    dom.photoTitle.textContent = ph.title;
    dom.photoCounter.textContent = `${state.photoIndex + 1} / ${state.photos.length}`;
  }

  function closePhotoFullViewer() {
    state.photoViewerOpen = false;
    dom.photoViewer.classList.add('hidden');
    renderPhotoGrid();
  }

  function stepPhoto(dir) {
    if (!state.photos.length) return;
    const next = Math.max(0, Math.min(state.photos.length - 1, state.photoIndex + dir));
    if (next !== state.photoIndex) {
      state.photoIndex = next;
      if (state.photoViewerOpen) {
        openPhotoFullViewer();
      } else {
        renderPhotoGrid();
      }
    }
  }

  // --------------------------------------------------------------------------
  // 11. JOGO CLÁSSICO DO IPOD: BRICK (BREAKOUT) CONTROLADO PELA CLICK WHEEL!
  // --------------------------------------------------------------------------
  let brickLoopId = null;
  const brickGame = {
    paddleX: 125,
    paddleW: 64,
    ballX: 160,
    ballY: 140,
    vx: 2.3,
    vy: -2.4,
    score: 0,
    lives: 3,
    paused: false,
    bricks: []
  };

  function initBricks() {
    const rows = 4;
    const cols = 8;
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
    brickGame.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        brickGame.bricks.push({
          x: 12 + c * 37,
          y: 26 + r * 15,
          w: 33,
          h: 11,
          color: colors[r],
          alive: true
        });
      }
    }
  }

  function startBrickGame() {
    dom.audioEl.pause();
    stopYouTubePlayback();
    updateStatusPlayIcon();

    showView('game', 'Brick');
    brickGame.paddleX = 128;
    brickGame.ballX = 160;
    brickGame.ballY = 165;
    brickGame.vx = 2.2;
    brickGame.vy = -2.3;
    brickGame.score = 0;
    brickGame.lives = 3;
    brickGame.paused = false;
    initBricks();
    cancelAnimationFrame(brickLoopId);
    brickLoopId = requestAnimationFrame(updateBrickGame);
  }

  function stopBrickGame() {
    cancelAnimationFrame(brickLoopId);
    brickLoopId = null;
    brickGame.paused = false;
    dom.audioEl.pause();
    updateStatusPlayIcon();
  }

  function toggleBrickPause() {
    brickGame.paused = !brickGame.paused;
    if (!brickGame.paused && state.currentView === 'game') {
      cancelAnimationFrame(brickLoopId);
      brickLoopId = requestAnimationFrame(updateBrickGame);
    }
  }

  function moveBrickPaddle(dir) {
    brickGame.paddleX = Math.max(6, Math.min(320 - brickGame.paddleW - 6, brickGame.paddleX + dir * 18));
  }

  function updateBrickGame() {
    if (state.currentView !== 'game') return;
    const ctx = dom.gameCanvas.getContext('2d');
    ctx.clearRect(0, 0, 320, 218);

    // Fundo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 320, 218);

    // Placar
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px Helvetica, Arial, sans-serif';
    ctx.fillText(`SCORE: ${brickGame.score}`, 12, 16);
    ctx.fillText(`VIDAS: ${'♥'.repeat(brickGame.lives)}`, 245, 16);

    // Tijolos
    brickGame.bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    // Raquete
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(brickGame.paddleX, 198, brickGame.paddleW, 8);

    // Bola
    ctx.beginPath();
    ctx.arc(brickGame.ballX, brickGame.ballY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    if (brickGame.paused) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fillRect(0, 0, 320, 218);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSADO', 160, 114);
      ctx.textAlign = 'left';
      brickLoopId = requestAnimationFrame(updateBrickGame);
      return;
    }

    // Física
    brickGame.ballX += brickGame.vx;
    brickGame.ballY += brickGame.vy;

    if (brickGame.ballX < 6 || brickGame.ballX > 314) brickGame.vx *= -1;
    if (brickGame.ballY < 22) brickGame.vy *= -1;

    // Colisão com a raquete
    if (
      brickGame.ballY >= 193 &&
      brickGame.ballY <= 204 &&
      brickGame.ballX >= brickGame.paddleX - 4 &&
      brickGame.ballX <= brickGame.paddleX + brickGame.paddleW + 4
    ) {
      const hitOffset = (brickGame.ballX - (brickGame.paddleX + brickGame.paddleW / 2)) / (brickGame.paddleW / 2);
      brickGame.vx = hitOffset * 3.1;
      brickGame.vy = -Math.abs(brickGame.vy);
      playWheelClick();
    }

    // Colisão com tijolos
    brickGame.bricks.forEach((b) => {
      if (!b.alive) return;
      if (
        brickGame.ballX > b.x &&
        brickGame.ballX < b.x + b.w &&
        brickGame.ballY > b.y &&
        brickGame.ballY < b.y + b.h
      ) {
        b.alive = false;
        brickGame.vy *= -1;
        brickGame.score += 10;
        playWheelClick();
      }
    });

    if (brickGame.bricks.every((b) => !b.alive)) {
      initBricks();
    }

    if (brickGame.ballY > 218) {
      brickGame.lives--;
      if (brickGame.lives <= 0) {
        brickGame.lives = 3;
        brickGame.score = 0;
        initBricks();
      }
      brickGame.ballX = 160;
      brickGame.ballY = 160;
      brickGame.vy = -2.3;
    }

    brickLoopId = requestAnimationFrame(updateBrickGame);
  }

  // --------------------------------------------------------------------------
  // 12. EXTRAS: RELÓGIO, NOTAS E SOBRE
  // --------------------------------------------------------------------------
  function openClockView() {
    showView('extra', 'Relógio');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    dom.extraContent.innerHTML = `
      <div class="clock-widget">
        <div class="clock-time">${timeStr}</div>
        <div class="clock-date">${dateStr}</div>
        <p style="font-size:11px;color:#64748b;margin-top:14px;">Horário Local • Brasília</p>
      </div>
    `;
  }

  function openNoteView(note) {
    showView('extra', note.title);
    dom.extraContent.innerHTML = `<div class="note-reader">${note.body.replace(/\n/g, '<br>')}</div>`;
  }

  function openAboutView() {
    showView('extra', 'Sobre');
    dom.extraContent.innerHTML = `
      <div style="text-align:center;line-height:1.65;font-size:12px;">
        <h3 style="font-size:14px;margin-bottom:4px;"> iPod Classic</h3>
        <p style="color:#475569;font-weight:700;">Capacidade: 160 GB (6ª Geração)</p>
        <hr style="margin:8px 0;border:none;border-top:1px solid #cbd5e1;">
        <p><strong>Músicas:</strong> ${state.songs.length}</p>
        <p><strong>Vídeos:</strong> ${state.videos.length}</p>
        <p><strong>Fotos:</strong> ${state.photos.length}</p>
        <p><strong>Versão OS:</strong> 2.0.4 Classic</p>
        <p style="color:#64748b;font-size:11px;margin-top:6px;">Modelo MB145 • Série 8K8249</p>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 13. FÍSICA DA CLICK WHEEL (GIRO EM CÍRCULO + BOTÕES + TECLADO)
  // --------------------------------------------------------------------------
  function onWheelStep(direction) {
    if (state.locked) return;
    playWheelClick();

    // 1. Se estiver nos menus (Split ou Full)
    if (state.currentView === 'split' || state.currentView === 'full') {
      const menu = currentMenu();
      if (!menu || !menu.items.length) return;
      const nextIdx = Math.max(0, Math.min(menu.items.length - 1, menu.selectedIndex + direction));
      if (nextIdx !== menu.selectedIndex) {
        menu.selectedIndex = nextIdx;
        renderCurrentMenu();
      }
      return;
    }

    // 2. Se estiver na tela Now Playing
    if (state.currentView === 'now-playing') {
      const track = state.playlist[state.currentTrackIndex] || state.songs[0];
      if (state.npMode === 'volume') {
        if (state.volumeControlMode === 'app') {
          state.volume = Math.max(0, Math.min(1, state.volume + direction * 0.05));
          dom.audioEl.volume = state.volume;
          if (ytReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
            ytPlayer.setVolume(Math.round(state.volume * 100));
          }
          showTemporaryVolumeBar();
        }
      } else if (state.npMode === 'scrub') {
        if (activeYoutubeMode === 'song' && ytReady && ytPlayer && typeof ytPlayer.getDuration === 'function') {
          const dur = ytPlayer.getDuration();
          const cur = ytPlayer.getCurrentTime();
          if (dur > 0) ytPlayer.seekTo(Math.max(0, Math.min(dur, cur + direction * 5)), true);
        } else if (dom.audioEl.duration) {
          dom.audioEl.currentTime = Math.max(0, Math.min(dom.audioEl.duration, dom.audioEl.currentTime + direction * 4));
        }
      } else if (state.npMode === 'rating' && track) {
        track.rating = Math.max(0, Math.min(5, (track.rating || 0) + direction));
        updateNowPlayingUI();
      }
      return;
    }

    // 3. Se estiver no Cover Flow
    if (state.currentView === 'coverflow') {
      stepCoverFlow(direction);
      return;
    }

    // 4. Se estiver nas Fotos
    if (state.currentView === 'photos') {
      stepPhoto(direction);
      return;
    }

    // 5. Se estiver no Vídeo
    if (state.currentView === 'video') {
      if (state.volumeControlMode === 'app') {
        state.volume = Math.max(0, Math.min(1, state.volume + direction * 0.05));
        dom.videoEl.volume = state.volume;
        if (dom.videoEl.dataset.ytAudioSync === '1') {
          dom.audioEl.volume = state.volume;
        }
        if (ytReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
          ytPlayer.setVolume(Math.round(state.volume * 100));
        }
      }
      pokeVideoHud();
      return;
    }

    // 6. Se estiver no Jogo Brick
    if (state.currentView === 'game') {
      moveBrickPaddle(direction);
    }
  }

  function onCenterSelect() {
    if (state.locked) return;
    playWheelClick(16);

    if (state.currentView === 'split' || state.currentView === 'full') {
      const menu = currentMenu();
      if (menu && menu.items[menu.selectedIndex]) {
        menu.items[menu.selectedIndex].action();
      }
      return;
    }

    if (state.currentView === 'now-playing') {
      cycleNowPlayingCenterMode();
      return;
    }

    if (state.currentView === 'coverflow') {
      const al = state.coverFlowAlbums[state.coverFlowIndex];
      if (al && al.songs.length) {
        playPlaylist(al.songs, 0);
      }
      return;
    }

    if (state.currentView === 'photos') {
      if (state.photoViewerOpen) {
        closePhotoFullViewer();
      } else {
        openPhotoFullViewer();
      }
      return;
    }

    if (state.currentView === 'video') {
      togglePlayPause();
      return;
    }

    if (state.currentView === 'game') {
      toggleBrickPause();
    }
  }

  // Cálculo trigonométrico de rotação na Click Wheel
  let isWheelDragging = false;
  let lastWheelAngle = null;
  let angleAccumulator = 0;

  function getAngleFromWheelCenter(clientX, clientY) {
    const rect = dom.clickWheel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  }

  dom.clickWheel.addEventListener('pointerdown', (e) => {
    if (e.target === dom.btnSelect) return;
    isWheelDragging = true;
    lastWheelAngle = getAngleFromWheelCenter(e.clientX, e.clientY);
    angleAccumulator = 0;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isWheelDragging || lastWheelAngle === null) return;
    const currentAngle = getAngleFromWheelCenter(e.clientX, e.clientY);
    let delta = currentAngle - lastWheelAngle;

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    angleAccumulator += delta;
    lastWheelAngle = currentAngle;

    const stepThreshold = state.wheelSensitivity === 'low'
      ? 22
      : state.wheelSensitivity === 'high'
        ? 8
        : 14;
    while (Math.abs(angleAccumulator) >= stepThreshold) {
      const dir = angleAccumulator > 0 ? 1 : -1;
      onWheelStep(dir);
      angleAccumulator -= dir * stepThreshold;
    }
  });

  window.addEventListener('pointerup', () => {
    isWheelDragging = false;
    lastWheelAngle = null;
  });

  // Scroll do mouse em cima da Click Wheel também gira a roda
  dom.clickWheel.addEventListener('wheel', (e) => {
    e.preventDefault();
    onWheelStep(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  // Botões físicos da Click Wheel
  dom.btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.locked) return;
    playWheelClick(16);
    popMenu();
  });

  dom.btnSelect.addEventListener('click', (e) => {
    e.stopPropagation();
    onCenterSelect();
  });

  dom.btnPlay.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
  });

  dom.btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    playWheelClick(16);
    nextTrack();
  });

  dom.btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    playWheelClick(16);
    prevTrack();
  });

  // Chave HOLD no topo do iPod
  dom.holdSwitch.addEventListener('click', () => {
    state.locked = !state.locked;
    triggerHapticPulse(20);
    dom.holdSwitch.classList.toggle('locked', state.locked);
    dom.statusLock.classList.toggle('hidden', !state.locked);
  });

  // Atalhos de Teclado
  window.addEventListener('keydown', (e) => {
    if (
      !dom.onlineModal.classList.contains('hidden') ||
      (dom.editSongModal && !dom.editSongModal.classList.contains('hidden')) ||
      (dom.playlistModal && !dom.playlistModal.classList.contains('hidden'))
    ) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onWheelStep(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onWheelStep(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (state.currentView === 'game') moveBrickPaddle(1);
      else nextTrack();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (state.currentView === 'game') moveBrickPaddle(-1);
      else prevTrack();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onCenterSelect();
    } else if (e.key === 'Backspace' || e.key === 'Escape') {
      e.preventDefault();
      playWheelClick();
      popMenu();
    } else if (e.key === ' ') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  // --------------------------------------------------------------------------
  // 14. IMPORTAÇÃO DE ARQUIVOS LOCAIS, PASTAS & DRAG-AND-DROP
  // --------------------------------------------------------------------------
  function updateLibraryStats() {
    if (dom.statSongs) dom.statSongs.textContent = state.songs.length;
    if (dom.statVideos) dom.statVideos.textContent = state.videos.length;
    if (dom.statPhotos) dom.statPhotos.textContent = state.photos.length;
  }

  function cleanFileName(name) {
    return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
  }

  function handleImportedFiles(fileList) {
    if (!fileList || !fileList.length) return;
    let addedSongs = 0;
    let addedVideos = 0;
    let addedPhotos = 0;

    Array.from(fileList).forEach((file) => {
      if (/\.json$/i.test(file.name) || file.type === 'application/json') {
        importLibraryBackupFile(file);
        return;
      }

      const url = URL.createObjectURL(file);
      const title = cleanFileName(file.name);

      if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) {
        // Tenta extrair Artista - Música se tiver hífen no nome do arquivo
        let artist = 'Biblioteca Local';
        let trackTitle = title;
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          artist = parts[0].trim();
          trackTitle = parts.slice(1).join(' - ').trim();
        }

        let cover = createCoverArt('#1e3a8a', '#3b82f6', trackTitle.slice(0, 16), artist.slice(0, 18), '🎵');
        let album = 'Arquivos do Computador';
        const fileKey = title.toLowerCase();
        const savedByFile = state.songEditsByName && state.songEditsByName[fileKey];
        if (savedByFile) {
          if (savedByFile.title) trackTitle = savedByFile.title;
          if (savedByFile.artist) artist = savedByFile.artist;
          if (savedByFile.album) album = savedByFile.album;
          if (savedByFile.cover) cover = savedByFile.cover;
        }

        const songObj = {
          id: 'local-s-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
          fileKey,
          title: trackTitle,
          artist,
          album,
          rating: 5,
          cover,
          url,
          isLocalIdb: true
        };
        state.songs.unshift(songObj);
        idbSaveMediaItem('song', songObj, file);
        addedSongs++;
      } else if (file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name)) {
        const vidObj = {
          id: 'local-v-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
          title,
          artist: 'Vídeo Local',
          url,
          cover: createCoverArt('#31102f', '#ec4899', title.slice(0, 16), 'Vídeo Local', '🎬'),
          isLocalIdb: true
        };
        state.videos.unshift(vidObj);
        idbSaveMediaItem('video', vidObj, file);
        addedVideos++;
      } else if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
        const photoObj = {
          id: 'local-p-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
          title,
          url,
          isLocalIdb: true
        };
        state.photos.unshift(photoObj);
        idbSaveMediaItem('photo', photoObj, file);
        addedPhotos++;
      }
    });

    updateLibraryStats();
    savePersistedState();

    if (addedSongs > 0) {
      playPlaylist(state.songs, 0);
    } else if (addedVideos > 0) {
      playVideo(state.videos[0]);
    } else if (addedPhotos > 0) {
      openPhotosView();
    } else {
      renderCurrentMenu();
    }
  }

  dom.fileInput.addEventListener('change', (e) => handleImportedFiles(e.target.files));
  dom.folderInput.addEventListener('change', (e) => handleImportedFiles(e.target.files));
  if (dom.backupInput) {
    dom.backupInput.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importLibraryBackupFile(f);
      e.target.value = '';
    });
  }

  // Drag & Drop direto sobre o iPod
  dom.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dom.dropZone.classList.add('drag-over');
  });

  dom.dropZone.addEventListener('dragleave', () => {
    dom.dropZone.classList.remove('drag-over');
  });

  dom.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dom.dropZone.classList.remove('drag-over');
    if (e.dataTransfer && e.dataTransfer.files) {
      handleImportedFiles(e.dataTransfer.files);
    }
  });

  // --------------------------------------------------------------------------
  // 15. MODAL DE MÍDIA ONLINE & YOUTUBE
  // --------------------------------------------------------------------------
  async function openOnlineModal(defaultType) {
    dom.onlineModal.classList.remove('hidden');
    if (typeof defaultType === 'string') {
      const sel = document.getElementById('custom-media-type');
      if (sel) sel.value = defaultType;
    }
    const warnEl = document.getElementById('yt-protocol-warning');
    if (warnEl) {
      const hasProxy = await checkProxyServer();
      if (hasProxy) {
        warnEl.innerHTML = 'Cole qualquer link do <strong>YouTube</strong> (ex: <code>https://www.youtube.com/watch?v=...</code> ou <code>https://youtu.be/...</code>) ou link direto de arquivo! Título e capa são preenchidos automaticamente.';
        warnEl.style.color = '';
      } else if (window.location.protocol === 'file:') {
        warnEl.innerHTML = '⚠️ <strong>Atenção:</strong> Você abriu o arquivo direto como <code>file://</code>. Use o servidor local ou hospede online (GitHub / Hostinger) para que o YouTube funcione normalmente.';
        warnEl.style.color = '#fbbf24';
      } else {
        warnEl.innerHTML = 'Cole qualquer link do <strong>YouTube</strong> (ex: <code>https://www.youtube.com/watch?v=...</code> ou <code>https://youtu.be/...</code>) ou link direto de MP3, MP4 ou Foto!';
        warnEl.style.color = '';
      }
    }
  }

  if (dom.btnOnlineModal) {
    dom.btnOnlineModal.addEventListener('click', () => openOnlineModal());
  }
  dom.btnCloseModal.addEventListener('click', () => dom.onlineModal.classList.add('hidden'));
  dom.onlineModal.addEventListener('click', (e) => {
    if (e.target === dom.onlineModal) dom.onlineModal.classList.add('hidden');
  });

  // Auto-preencher título, canal e capa quando o usuário colar um link do YouTube
  const customUrlInput = document.getElementById('custom-media-url');
  const customTitleInput = document.getElementById('custom-media-title');
  const customArtistInput = document.getElementById('custom-media-artist');
  const customAlbumInput = document.getElementById('custom-media-album');
  const customCoverInput = document.getElementById('custom-media-cover');
  const customTypeSelect = document.getElementById('custom-media-type');

  async function resolveYouTubeMetaData(ytId, rawUrl) {
    const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    try {
      const hasProxy = await checkProxyServer();
      if (hasProxy) {
        const res = await fetch(`${proxyApiBase}/api/yt-meta?url=${encodeURIComponent(rawUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            return {
              title: data.title,
              artist: data.artist || 'YouTube',
              thumbnail: data.thumbnail || thumbUrl
            };
          }
        }
      }
    } catch (_) {}

    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(rawUrl)}`);
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          artist: data.author_name || 'YouTube',
          thumbnail: data.thumbnail_url || thumbUrl
        };
      }
    } catch (_) {}

    return null;
  }

  async function fetchYouTubeMeta(ytId, rawUrl) {
    const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    if (!customCoverInput.value.trim()) {
      customCoverInput.value = thumbUrl;
    }
    if (!customAlbumInput.value.trim()) {
      customAlbumInput.value = 'YouTube';
    }
    const meta = await resolveYouTubeMetaData(ytId, rawUrl);
    if (meta) {
      if (meta.title && !customTitleInput.value.trim()) {
        customTitleInput.value = meta.title;
      }
      if (meta.artist && !customArtistInput.value.trim()) {
        customArtistInput.value = meta.artist;
      }
      if (meta.thumbnail && (!customCoverInput.value.trim() || customCoverInput.value === thumbUrl)) {
        customCoverInput.value = meta.thumbnail;
      }
    }
  }

  function fetchYouTubeMetaInBackground(ytId, rawUrl, item, isSong) {
    resolveYouTubeMetaData(ytId, rawUrl).then((meta) => {
      if (!meta) return;
      if (meta.title && item.title.startsWith('YouTube (')) {
        item.title = meta.title;
      }
      if (meta.artist && item.artist === 'YouTube') {
        item.artist = meta.artist;
      }
      if (meta.thumbnail) {
        item.cover = meta.thumbnail;
      }
      savePersistedState();
      if (isSong) {
        if (state.currentView === 'now-playing' && state.playlist[state.currentTrackIndex] === item) {
          updateNowPlayingUI();
        }
      } else if (state.currentView === 'video') {
        dom.videoEl.dataset.realTitle = item.title;
        dom.videoTitle.textContent = item.title;
      }
    });
  }

  customUrlInput.addEventListener('input', () => {
    const url = customUrlInput.value.trim();
    const ytId = extractYouTubeId(url);
    if (ytId) {
      if (customTypeSelect.value !== 'youtube-video' && customTypeSelect.value !== 'youtube-song') {
        customTypeSelect.value = 'youtube-video';
      }
      fetchYouTubeMeta(ytId, url);
    }
  });

  // Adicionar URL customizada (síncrono no clique para preservar autoplay no celular!)
  dom.btnAddCustomUrl.addEventListener('click', () => {
    let type = customTypeSelect.value;
    const url = customUrlInput.value.trim();
    if (!url) return;

    const ytId = extractYouTubeId(url);
    if (ytId && type !== 'youtube-video' && type !== 'youtube-song') {
      type = 'youtube-video';
    }

    const hadTitle = Boolean(customTitleInput.value.trim());
    const title = customTitleInput.value.trim() || (ytId ? `YouTube (${ytId})` : 'Mídia Online');
    const artist = customArtistInput.value.trim() || (ytId ? 'YouTube' : 'Online Stream');
    const album = customAlbumInput.value.trim() || (ytId ? 'YouTube' : 'Internet');
    const cover = customCoverInput.value.trim() || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');

    // Limpar campos para a próxima adição
    customUrlInput.value = '';
    customTitleInput.value = '';
    customArtistInput.value = '';
    customAlbumInput.value = '';
    customCoverInput.value = '';

    if (type === 'youtube-video' && ytId) {
      const vid = {
        id: 'yt-v-' + ytId + '-' + Date.now(),
        title,
        artist,
        url,
        youtubeId: ytId,
        cover
      };
      state.videos.unshift(vid);
      updateLibraryStats();
      savePersistedState();
      dom.onlineModal.classList.add('hidden');
      playVideo(vid);
      if (!hadTitle) fetchYouTubeMetaInBackground(ytId, url, vid, false);
      return;
    }

    if (type === 'youtube-song' && ytId) {
      const song = {
        id: 'yt-s-' + ytId + '-' + Date.now(),
        title,
        artist,
        album,
        rating: 5,
        cover,
        url,
        youtubeId: ytId
      };
      state.songs.unshift(song);
      updateLibraryStats();
      savePersistedState();
      dom.onlineModal.classList.add('hidden');
      playPlaylist(state.songs, 0);
      if (!hadTitle) fetchYouTubeMetaInBackground(ytId, url, song, true);
      return;
    }

    if (type === 'song') {
      state.songs.unshift({
        id: 'url-s-' + Date.now(),
        title,
        artist,
        album,
        rating: 5,
        cover: cover || createCoverArt('#0f766e', '#2dd4bf', title.slice(0, 16), artist.slice(0, 16), '🌐'),
        url
      });
      updateLibraryStats();
      savePersistedState();
      dom.onlineModal.classList.add('hidden');
      playPlaylist(state.songs, 0);
    } else if (type === 'video') {
      const vid = {
        id: 'url-v-' + Date.now(),
        title,
        artist,
        url,
        cover: cover || createCoverArt('#4c1d95', '#a78bfa', title.slice(0, 16), artist.slice(0, 16), '🎬')
      };
      state.videos.unshift(vid);
      updateLibraryStats();
      savePersistedState();
      dom.onlineModal.classList.add('hidden');
      playVideo(vid);
    } else if (type === 'photo') {
      state.photos.unshift({
        id: 'url-p-' + Date.now(),
        title,
        url
      });
      updateLibraryStats();
      savePersistedState();
      dom.onlineModal.classList.add('hidden');
      openPhotosView();
    }
  });

  // --------------------------------------------------------------------------
  // 15B. MODAL DE EDIÇÃO DE MÚSICA / CAPA & CRIADOR DE PLAYLISTS
  // --------------------------------------------------------------------------
  let pendingUploadedCoverDataUrl = '';

  function resizeImageFileToDataUrl(file, maxSize = 300) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext('2d');
          // Crop central quadrado para ficar perfeito na capa do iPod e Cover Flow
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
          resolve(canvas.toDataURL('image/jpeg', 0.86));
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function populateEditSongFields(songId) {
    const song = state.songs.find((s) => s.id === songId) || state.songs[0];
    if (!song) return;
    dom.editSongSelect.value = song.id;
    dom.editSongTitle.value = song.title || '';
    dom.editSongArtist.value = song.artist || '';
    dom.editSongAlbum.value = song.album || '';
    dom.editSongCoverPreview.src = song.cover || jackCover;
    dom.editSongCoverUrl.value = (song.cover && !song.cover.startsWith('data:')) ? song.cover : '';
    pendingUploadedCoverDataUrl = '';
    if (dom.editSongCoverFile) dom.editSongCoverFile.value = '';
  }

  function openEditSongModal(preselectSongId, defaultScope = 'song') {
    if (!dom.editSongModal || !state.songs.length) return;
    dom.editSongSelect.innerHTML = '';
    state.songs.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.title} — ${s.artist}`;
      dom.editSongSelect.appendChild(opt);
    });

    const targetId = preselectSongId ||
      (state.playlist[state.currentTrackIndex] && state.playlist[state.currentTrackIndex].id) ||
      state.songs[0].id;

    if (dom.editSongCoverScope) {
      dom.editSongCoverScope.value = defaultScope;
    }
    populateEditSongFields(targetId);
    dom.editSongModal.classList.remove('hidden');
  }

  if (dom.editSongSelect) {
    dom.editSongSelect.addEventListener('change', () => {
      populateEditSongFields(dom.editSongSelect.value);
    });
  }

  if (dom.editSongCoverFile) {
    dom.editSongCoverFile.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await resizeImageFileToDataUrl(file, 300);
        pendingUploadedCoverDataUrl = dataUrl;
        dom.editSongCoverPreview.src = dataUrl;
        dom.editSongCoverUrl.value = '';
      } catch (_) {}
    });
  }

  if (dom.editSongCoverUrl) {
    dom.editSongCoverUrl.addEventListener('input', () => {
      const url = dom.editSongCoverUrl.value.trim();
      if (url) {
        pendingUploadedCoverDataUrl = '';
        dom.editSongCoverPreview.src = url;
      }
    });
  }

  function recordSongEditPersistence(song) {
    if (!song) return;
    const editData = {
      title: song.title,
      artist: song.artist,
      album: song.album,
      cover: song.cover
    };
    state.songEdits[song.id] = editData;
    if (song.fileKey) {
      state.songEditsByName[song.fileKey] = editData;
    }
  }

  if (dom.btnSaveEditSong) {
    dom.btnSaveEditSong.addEventListener('click', () => {
      const songId = dom.editSongSelect.value;
      const song = state.songs.find((s) => s.id === songId);
      if (!song) return;

      const oldAlbum = song.album || 'Álbum Desconhecido';
      const oldArtist = song.artist || 'Artista Desconhecido';

      const newTitle = dom.editSongTitle.value.trim() || song.title;
      const newArtist = dom.editSongArtist.value.trim() || song.artist;
      const newAlbum = dom.editSongAlbum.value.trim() || song.album;
      const customUrl = dom.editSongCoverUrl.value.trim();
      const newCover = pendingUploadedCoverDataUrl || customUrl || song.cover;
      const scope = dom.editSongCoverScope ? dom.editSongCoverScope.value : 'song';

      song.title = newTitle;
      song.artist = newArtist;
      song.album = newAlbum;
      song.cover = newCover;
      recordSongEditPersistence(song);

      if (scope === 'album') {
        state.songs.forEach((s) => {
          if ((s.album || 'Álbum Desconhecido') === oldAlbum || (s.album || 'Álbum Desconhecido') === newAlbum) {
            s.cover = newCover;
            s.album = newAlbum;
            recordSongEditPersistence(s);
          }
        });
      } else if (scope === 'artist') {
        state.songs.forEach((s) => {
          if ((s.artist || 'Artista Desconhecido') === oldArtist || (s.artist || 'Artista Desconhecido') === newArtist) {
            s.cover = newCover;
            s.artist = newArtist;
            recordSongEditPersistence(s);
          }
        });
      }

      savePersistedState();
      updateNowPlayingUI();
      refreshAllMenusInStack();
      dom.editSongModal.classList.add('hidden');
    });
  }

  if (dom.btnCloseEditSong) {
    dom.btnCloseEditSong.addEventListener('click', () => dom.editSongModal.classList.add('hidden'));
  }
  if (dom.editSongModal) {
    dom.editSongModal.addEventListener('click', (e) => {
      if (e.target === dom.editSongModal) dom.editSongModal.classList.add('hidden');
    });
  }

  // --- CRIADOR E EDITOR DE PLAYLISTS ---
  function openPlaylistModal(playlistId = '') {
    if (!dom.playlistModal) return;
    const existing = playlistId ? state.customPlaylists.find((p) => p.id === playlistId) : null;
    dom.playlistEditId.value = existing ? existing.id : '';
    dom.playlistModalTitle.textContent = existing ? `✏️ Editar Playlist: ${existing.name}` : '🎶 Criar Nova Playlist';
    dom.playlistNameInput.value = existing ? existing.name : '';

    const selectedSet = new Set(existing ? existing.songIds : []);
    dom.playlistSongsChecklist.innerHTML = '';

    state.songs.forEach((song) => {
      const row = document.createElement('label');
      row.className = 'playlist-check-row';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = song.id;
      cb.checked = selectedSet.has(song.id);

      const img = document.createElement('img');
      img.src = song.cover || jackCover;
      img.alt = '';

      const meta = document.createElement('div');
      meta.className = 'playlist-check-meta';
      const st = document.createElement('strong');
      st.textContent = song.title;
      const sp = document.createElement('span');
      sp.textContent = `${song.artist} • ${song.album}`;
      meta.appendChild(st);
      meta.appendChild(sp);

      row.appendChild(cb);
      row.appendChild(img);
      row.appendChild(meta);
      dom.playlistSongsChecklist.appendChild(row);
    });

    dom.playlistModal.classList.remove('hidden');
    setTimeout(() => dom.playlistNameInput.focus(), 50);
  }

  if (dom.btnPlaylistSelectAll) {
    dom.btnPlaylistSelectAll.addEventListener('click', () => {
      dom.playlistSongsChecklist.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.checked = true;
      });
    });
  }

  if (dom.btnPlaylistClearAll) {
    dom.btnPlaylistClearAll.addEventListener('click', () => {
      dom.playlistSongsChecklist.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
      });
    });
  }

  if (dom.btnSavePlaylist) {
    dom.btnSavePlaylist.addEventListener('click', () => {
      const editId = dom.playlistEditId.value;
      const name = dom.playlistNameInput.value.trim() || `Playlist ${state.customPlaylists.length + 1}`;
      const checkedIds = Array.from(
        dom.playlistSongsChecklist.querySelectorAll('input[type="checkbox"]:checked')
      ).map((cb) => cb.value);

      if (editId) {
        const pl = state.customPlaylists.find((p) => p.id === editId);
        if (pl) {
          pl.name = name;
          pl.songIds = checkedIds;
        }
      } else {
        state.customPlaylists.push({
          id: 'pl-' + Date.now(),
          name,
          songIds: checkedIds
        });
      }

      savePersistedState();
      refreshAllMenusInStack();
      dom.playlistModal.classList.add('hidden');
    });
  }

  if (dom.btnClosePlaylistModal) {
    dom.btnClosePlaylistModal.addEventListener('click', () => dom.playlistModal.classList.add('hidden'));
  }
  if (dom.playlistModal) {
    dom.playlistModal.addEventListener('click', (e) => {
      if (e.target === dom.playlistModal) dom.playlistModal.classList.add('hidden');
    });
  }

  // --------------------------------------------------------------------------
  // 16. ALTERNAR COR DO IPOD & PERSISTÊNCIA LOCAL (LOCALSTORAGE)
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'ipod_classic_state_v1';
  const BUILTIN_IDS = new Set([
    'jj-1', 'jj-2', 'jj-3', 'jj-4', 'dp-1', 'cp-1', 'am-1', 'br-1',
    'vid-1', 'vid-2', 'vid-3',
    'ph-1', 'ph-2', 'ph-3', 'ph-4', 'ph-5', 'ph-6'
  ]);

  function isPersistableItem(item) {
    if (!item || item.isDemo || BUILTIN_IDS.has(item.id)) return false;
    if (!item.url || String(item.url).startsWith('blob:')) return false;
    return true;
  }

  function savePersistedState() {
    try {
      const payload = {
        skinIndex: state.skinIndex,
        theme: state.theme,
        coverFlowStyle: state.coverFlowStyle,
        wheelSize: state.wheelSize,
        wheelSensitivity: state.wheelSensitivity,
        touchScreenEnabled: state.touchScreenEnabled,
        volumeControlMode: state.volumeControlMode,
        splitScreenEnabled: state.splitScreenEnabled,
        shuffle: state.shuffle,
        repeat: state.repeat,
        clickSoundEnabled: state.clickSoundEnabled,
        vibrateEnabled: state.vibrateEnabled,
        deletedBuiltinIds: state.deletedBuiltinIds,
        songEdits: state.songEdits,
        songEditsByName: state.songEditsByName,
        customPlaylists: state.customPlaylists,
        songs: state.songs.filter(isPersistableItem),
        videos: state.videos.filter(isPersistableItem),
        photos: state.photos.filter(isPersistableItem)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  function loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return;

      if (typeof saved.skinIndex === 'number') {
        setSkinByIndex(saved.skinIndex, false);
      }
      if (['light', 'dark'].includes(saved.theme)) state.theme = saved.theme;
      if (['original', 'flat', 'carousel'].includes(saved.coverFlowStyle)) state.coverFlowStyle = saved.coverFlowStyle;
      if (['small', 'medium', 'large'].includes(saved.wheelSize)) state.wheelSize = saved.wheelSize;
      if (['low', 'medium', 'high'].includes(saved.wheelSensitivity)) state.wheelSensitivity = saved.wheelSensitivity;
      if (typeof saved.touchScreenEnabled === 'boolean') state.touchScreenEnabled = saved.touchScreenEnabled;
      if (['app', 'device'].includes(saved.volumeControlMode)) state.volumeControlMode = saved.volumeControlMode;
      if (typeof saved.splitScreenEnabled === 'boolean') state.splitScreenEnabled = saved.splitScreenEnabled;
      if (typeof saved.shuffle === 'boolean') state.shuffle = saved.shuffle;
      if (['off', 'one', 'all'].includes(saved.repeat)) state.repeat = saved.repeat;
      if (typeof saved.clickSoundEnabled === 'boolean') state.clickSoundEnabled = saved.clickSoundEnabled;
      if (typeof saved.vibrateEnabled === 'boolean') state.vibrateEnabled = saved.vibrateEnabled;

      if (Array.isArray(saved.deletedBuiltinIds)) {
        state.deletedBuiltinIds = saved.deletedBuiltinIds.filter((id) => typeof id === 'string');
        const delSet = new Set(state.deletedBuiltinIds);
        state.songs = state.songs.filter((s) => !delSet.has(s.id));
        state.videos = state.videos.filter((v) => !delSet.has(v.id));
        state.photos = state.photos.filter((p) => !delSet.has(p.id));
      }

      if (Array.isArray(saved.songs) && saved.songs.length) {
        const cleanSongs = saved.songs.filter(isPersistableItem);
        state.songs = [...cleanSongs, ...state.songs];
      }
      if (Array.isArray(saved.videos) && saved.videos.length) {
        const cleanVideos = saved.videos.filter(isPersistableItem);
        state.videos = [...cleanVideos, ...state.videos];
      }
      if (Array.isArray(saved.photos) && saved.photos.length) {
        const cleanPhotos = saved.photos.filter(isPersistableItem);
        state.photos = [...cleanPhotos, ...state.photos];
      }

      if (saved.songEdits && typeof saved.songEdits === 'object') {
        state.songEdits = saved.songEdits;
        state.songs.forEach((song) => {
          const edit = state.songEdits[song.id];
          if (edit && typeof edit === 'object') {
            if (edit.title) song.title = edit.title;
            if (edit.artist) song.artist = edit.artist;
            if (edit.album) song.album = edit.album;
            if (edit.cover) song.cover = edit.cover;
          }
        });
      }

      if (saved.songEditsByName && typeof saved.songEditsByName === 'object') {
        state.songEditsByName = saved.songEditsByName;
      }

      if (Array.isArray(saved.customPlaylists)) {
        state.customPlaylists = saved.customPlaylists.filter(
          (pl) => pl && typeof pl.id === 'string' && typeof pl.name === 'string' && Array.isArray(pl.songIds)
        );
      }
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // 16B. BANCO DE DADOS NO DISPOSITIVO (INDEXEDDB) & ARQUIVO DE BACKUP (.JSON)
  // --------------------------------------------------------------------------
  const IDB_NAME = 'ipod_classic_media_db_v1';
  const IDB_STORE = 'media_items';

  function openMediaIdb() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB indisponível'));
        return;
      }
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbSaveMediaItem(kind, itemObj, blob) {
    try {
      const db = await openMediaIdb();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const metaCopy = { ...itemObj };
      delete metaCopy.url;
      store.put({
        id: itemObj.id,
        kind,
        meta: metaCopy,
        blob,
        savedAt: Date.now()
      });
    } catch (_) {}
  }

  async function idbDeleteMediaItem(id) {
    try {
      const db = await openMediaIdb();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(id);
    } catch (_) {}
  }

  async function idbGetAllMediaRecords() {
    try {
      const db = await openMediaIdb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      return [];
    }
  }

  async function idbRestoreSavedMedia() {
    const records = await idbGetAllMediaRecords();
    if (!records.length) return;

    const existingSongIds = new Set(state.songs.map((s) => s.id));
    const existingVideoIds = new Set(state.videos.map((v) => v.id));
    const existingPhotoIds = new Set(state.photos.map((p) => p.id));

    records.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));

    records.forEach((rec) => {
      if (!rec || !rec.blob || !rec.meta) return;
      const url = URL.createObjectURL(rec.blob);
      const item = { ...rec.meta, url, isLocalIdb: true };

      if (rec.kind === 'song' && !existingSongIds.has(item.id)) {
        const edit = state.songEdits[item.id] || (item.fileKey && state.songEditsByName[item.fileKey]);
        if (edit) {
          if (edit.title) item.title = edit.title;
          if (edit.artist) item.artist = edit.artist;
          if (edit.album) item.album = edit.album;
          if (edit.cover) item.cover = edit.cover;
        }
        state.songs.unshift(item);
        existingSongIds.add(item.id);
      } else if (rec.kind === 'video' && !existingVideoIds.has(item.id)) {
        state.videos.unshift(item);
        existingVideoIds.add(item.id);
      } else if (rec.kind === 'photo' && !existingPhotoIds.has(item.id)) {
        state.photos.unshift(item);
        existingPhotoIds.add(item.id);
      }
    });

    state.playlist = [...state.songs];
    state.currentTrackIndex = 0;
    updateLibraryStats();
    updateNowPlayingUI();
    refreshAllMenusInStack();
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  async function exportLibraryBackupFile() {
    showView('extra', 'Salvando Backup...');
    dom.extraContent.innerHTML = `
      <div style="text-align:center;font-size:12px;line-height:1.5;padding-top:22px;">
        <div style="font-size:32px;margin-bottom:6px;">💾</div>
        <strong>Gerando arquivo de backup...</strong>
        <p style="color:#475569;margin-top:6px;">Empacotando suas músicas, capas, playlists, vídeos e fotos.</p>
      </div>
    `;

    try {
      const idbRecords = await idbGetAllMediaRecords();
      const localMediaExport = [];

      for (const rec of idbRecords) {
        if (!rec || !rec.blob || !rec.meta) continue;
        // Limite de 25MB por arquivo individual no JSON para não travar a memória do navegador
        if (rec.blob.size <= 25 * 1024 * 1024) {
          const dataUrl = await blobToDataUrl(rec.blob);
          const latestSong = rec.kind === 'song' ? state.songs.find((s) => s.id === rec.id) : null;
          const metaToSave = latestSong ? { ...latestSong } : { ...rec.meta };
          delete metaToSave.url;
          localMediaExport.push({
            id: rec.id,
            kind: rec.kind,
            meta: metaToSave,
            dataUrl,
            savedAt: rec.savedAt || Date.now()
          });
        }
      }

      const backupData = {
        app: 'iPod Classic 160GB',
        version: 1,
        exportedAt: new Date().toISOString(),
        skinIndex: state.skinIndex,
        shuffle: state.shuffle,
        repeat: state.repeat,
        clickSoundEnabled: state.clickSoundEnabled,
        vibrateEnabled: state.vibrateEnabled,
        deletedBuiltinIds: state.deletedBuiltinIds,
        songEdits: state.songEdits,
        songEditsByName: state.songEditsByName,
        customPlaylists: state.customPlaylists,
        onlineSongs: state.songs.filter(isPersistableItem),
        onlineVideos: state.videos.filter(isPersistableItem),
        onlinePhotos: state.photos.filter(isPersistableItem),
        localMedia: localMediaExport
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `iPod-Classic-Backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

      dom.extraContent.innerHTML = `
        <div style="text-align:center;font-size:12px;line-height:1.5;padding-top:16px;">
          <div style="font-size:32px;margin-bottom:6px;">✅</div>
          <strong>Backup salvo no dispositivo!</strong>
          <p style="color:#475569;margin-top:6px;">Arquivo <code>iPod-Classic-Backup-${dateStr}.json</code> baixado com sucesso.</p>
          <p style="color:#475569;margin-top:4px;">Use <strong>Carregar Backup</strong> para restaurar quando quiser.</p>
        </div>
      `;
    } catch (err) {
      dom.extraContent.innerHTML = `
        <div style="text-align:center;font-size:12px;line-height:1.5;padding-top:18px;">
          <div style="font-size:30px;margin-bottom:6px;">⚠️</div>
          <strong>Erro ao gerar backup</strong>
          <p style="color:#475569;margin-top:6px;">${err && err.message ? err.message : 'Tente novamente.'}</p>
        </div>
      `;
    }
  }

  async function importLibraryBackupFile(file) {
    if (!file) return;
    showView('extra', 'Restaurando...');
    dom.extraContent.innerHTML = `
      <div style="text-align:center;font-size:12px;line-height:1.5;padding-top:22px;">
        <div style="font-size:32px;margin-bottom:6px;">📥</div>
        <strong>Carregando backup...</strong>
        <p style="color:#475569;margin-top:6px;">Restaurando músicas, capas, playlists, vídeos e fotos.</p>
      </div>
    `;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object') {
        throw new Error('Arquivo de backup inválido.');
      }

      if (typeof data.skinIndex === 'number') setSkinByIndex(data.skinIndex, false);
      if (typeof data.shuffle === 'boolean') state.shuffle = data.shuffle;
      if (['off', 'one', 'all'].includes(data.repeat)) state.repeat = data.repeat;
      if (typeof data.clickSoundEnabled === 'boolean') state.clickSoundEnabled = data.clickSoundEnabled;
      if (typeof data.vibrateEnabled === 'boolean') state.vibrateEnabled = data.vibrateEnabled;

      if (Array.isArray(data.deletedBuiltinIds)) {
        state.deletedBuiltinIds = data.deletedBuiltinIds;
        const delSet = new Set(state.deletedBuiltinIds);
        state.songs = state.songs.filter((s) => !delSet.has(s.id));
        state.videos = state.videos.filter((v) => !delSet.has(v.id));
        state.photos = state.photos.filter((p) => !delSet.has(p.id));
      }

      if (data.songEdits && typeof data.songEdits === 'object') {
        state.songEdits = { ...state.songEdits, ...data.songEdits };
      }
      if (data.songEditsByName && typeof data.songEditsByName === 'object') {
        state.songEditsByName = { ...state.songEditsByName, ...data.songEditsByName };
      }

      const existingSongIds = new Set(state.songs.map((s) => s.id));
      const existingVideoIds = new Set(state.videos.map((v) => v.id));
      const existingPhotoIds = new Set(state.photos.map((p) => p.id));

      if (Array.isArray(data.onlineSongs)) {
        data.onlineSongs.forEach((s) => {
          if (s && s.id && !existingSongIds.has(s.id)) {
            state.songs.unshift(s);
            existingSongIds.add(s.id);
          }
        });
      }
      if (Array.isArray(data.onlineVideos)) {
        data.onlineVideos.forEach((v) => {
          if (v && v.id && !existingVideoIds.has(v.id)) {
            state.videos.unshift(v);
            existingVideoIds.add(v.id);
          }
        });
      }
      if (Array.isArray(data.onlinePhotos)) {
        data.onlinePhotos.forEach((p) => {
          if (p && p.id && !existingPhotoIds.has(p.id)) {
            state.photos.unshift(p);
            existingPhotoIds.add(p.id);
          }
        });
      }

      if (Array.isArray(data.localMedia)) {
        for (const item of data.localMedia) {
          if (!item || !item.dataUrl || !item.meta) continue;
          const blob = dataUrlToBlob(item.dataUrl);
          const url = URL.createObjectURL(blob);
          const restoredObj = { ...item.meta, url, isLocalIdb: true };

          if (item.kind === 'song' && !existingSongIds.has(restoredObj.id)) {
            state.songs.unshift(restoredObj);
            existingSongIds.add(restoredObj.id);
            await idbSaveMediaItem('song', restoredObj, blob);
          } else if (item.kind === 'video' && !existingVideoIds.has(restoredObj.id)) {
            state.videos.unshift(restoredObj);
            existingVideoIds.add(restoredObj.id);
            await idbSaveMediaItem('video', restoredObj, blob);
          } else if (item.kind === 'photo' && !existingPhotoIds.has(restoredObj.id)) {
            state.photos.unshift(restoredObj);
            existingPhotoIds.add(restoredObj.id);
            await idbSaveMediaItem('photo', restoredObj, blob);
          }
        }
      }

      // Aplicar edições de título/artista/álbum/capa em todas as músicas
      state.songs.forEach((song) => {
        const edit = state.songEdits[song.id] || (song.fileKey && state.songEditsByName[song.fileKey]);
        if (edit && typeof edit === 'object') {
          if (edit.title) song.title = edit.title;
          if (edit.artist) song.artist = edit.artist;
          if (edit.album) song.album = edit.album;
          if (edit.cover) song.cover = edit.cover;
        }
      });

      if (Array.isArray(data.customPlaylists)) {
        const plIds = new Set(state.customPlaylists.map((p) => p.id));
        data.customPlaylists.forEach((pl) => {
          if (!pl || !pl.id || !pl.name || !Array.isArray(pl.songIds)) return;
          if (plIds.has(pl.id)) {
            const target = state.customPlaylists.find((p) => p.id === pl.id);
            if (target) {
              target.name = pl.name;
              target.songIds = pl.songIds;
            }
          } else {
            state.customPlaylists.push(pl);
            plIds.add(pl.id);
          }
        });
      }

      state.playlist = [...state.songs];
      state.currentTrackIndex = 0;
      savePersistedState();
      updateLibraryStats();
      updateNowPlayingUI();
      refreshAllMenusInStack();

      dom.extraContent.innerHTML = `
        <div style="text-align:center;font-size:12px;line-height:1.5;padding-top:16px;">
          <div style="font-size:32px;margin-bottom:6px;">🎉</div>
          <strong>Backup Restaurado!</strong>
          <p style="color:#475569;margin-top:6px;">${state.songs.length} músicas • ${state.customPlaylists.length} playlists • ${state.videos.length} vídeos • ${state.photos.length} fotos</p>
          <p style="color:#475569;margin-top:6px;">Aperte <strong>MENU</strong> para voltar.</p>
        </div>
      `;
    } catch (err) {
      dom.extraContent.innerHTML = `
        <div style="text-align:center;font-size:12px;line-height:1.5;padding-top:18px;">
          <div style="font-size:30px;margin-bottom:6px;">⚠️</div>
          <strong>Falha ao restaurar backup</strong>
          <p style="color:#475569;margin-top:6px;">Verifique se o arquivo selecionado é um backup <code>.json</code> válido do iPod.</p>
        </div>
      `;
    }
  }

  function setSkinByIndex(idx, shouldSave = true) {
    state.skins.forEach((s) => dom.ipodShell.classList.remove(s.id));
    state.skinIndex = ((idx % state.skins.length) + state.skins.length) % state.skins.length;
    const nextSkin = state.skins[state.skinIndex];
    dom.ipodShell.classList.add(nextSkin.id);
    if (dom.btnSkinToggle) {
      dom.btnSkinToggle.innerHTML = `<span>🎨 Cor: ${nextSkin.name}</span>`;
    }
    if (shouldSave) savePersistedState();
  }

  function cycleSkin() {
    setSkinByIndex(state.skinIndex + 1);
  }

  if (dom.btnSkinToggle) {
    dom.btnSkinToggle.addEventListener('click', cycleSkin);
  }

  // --------------------------------------------------------------------------
  // 17. INSTALAÇÃO PWA (APP), ESCALA TELA CHEIA & INICIALIZAÇÃO
  // --------------------------------------------------------------------------
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (state.currentView === 'split' || state.currentView === 'full') {
      renderCurrentMenu();
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (state.currentView === 'split' || state.currentView === 'full') {
      renderCurrentMenu();
    }
  });

  function installPwaApp() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice
        .then(() => {
          deferredInstallPrompt = null;
          if (state.currentView === 'split' || state.currentView === 'full') {
            renderCurrentMenu();
          }
        })
        .catch(() => {});
      return;
    }

    showView('extra', 'Instalar App');
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      dom.extraContent.innerHTML = `
        <div style="text-align:center;font-size:12px;line-height:1.5;padding-top:16px;">
          <div style="font-size:34px;margin-bottom:6px;">✅</div>
          <strong>Aplicativo já instalado!</strong>
          <p style="color:#475569;margin-top:6px;">Você já está rodando o iPod Classic em modo aplicativo na tela cheia.</p>
        </div>
      `;
      return;
    }

    dom.extraContent.innerHTML = isIos
      ? `
        <div style="font-size:12px;line-height:1.5;">
          <p style="font-weight:700;margin-bottom:8px;">📲 Instalar no iPhone / iPad:</p>
          <p>1. Toque no ícone <strong>Compartilhar (⬆️)</strong> na barra do Safari.</p>
          <p style="margin-top:6px;">2. Role e toque em <strong>"Adicionar à Tela de Início"</strong>.</p>
          <p style="margin-top:6px;">3. Abra o ícone do iPod pela tela inicial para usar em tela cheia sem barras!</p>
        </div>
      `
      : `
        <div style="font-size:12px;line-height:1.5;">
          <p style="font-weight:700;margin-bottom:8px;">📲 Instalar no Celular ou PC:</p>
          <p>• <strong>Android (Chrome):</strong> Toque no menu <strong>⋮</strong> do navegador → <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
          <p style="margin-top:6px;">• <strong>Computador (Chrome / Edge):</strong> Clique no ícone de instalar <strong>⊕</strong> na barra de endereço.</p>
          <p style="margin-top:6px;color:#475569;font-size:11px;">(Requer acesso via HTTPS no GitHub Pages / Hostinger ou localhost.)</p>
        </div>
      `;
  }

  function updateIpodScale() {
    if (!dom.lcdBezelSlot || !dom.lcdBezel || !dom.clickWheelSlot || !dom.clickWheel) return;

    const availW = window.innerWidth - 16;
    const availH = window.innerHeight * 0.51;
    const lcdScale = Math.max(0.75, Math.min(availW / 328, availH / 276, 2.35));
    dom.lcdBezelSlot.style.width = `${Math.round(328 * lcdScale)}px`;
    dom.lcdBezelSlot.style.height = `${Math.round(276 * lcdScale)}px`;
    dom.lcdBezel.style.transform = `scale(${lcdScale})`;

    const wheelAvailW = window.innerWidth * 0.78;
    const wheelAvailH = window.innerHeight * 0.42;
    const maxWheelScale = Math.max(0.6, Math.min(wheelAvailW / 232, wheelAvailH / 232, 2.1));
    const sizeMultiplier = state.wheelSize === 'small'
      ? 0.66
      : state.wheelSize === 'medium'
        ? 0.84
        : 1.04;
    const wheelScale = Math.max(0.55, Math.min(maxWheelScale * sizeMultiplier, maxWheelScale));
    dom.clickWheelSlot.style.width = `${Math.round(232 * wheelScale)}px`;
    dom.clickWheelSlot.style.height = `${Math.round(232 * wheelScale)}px`;
    dom.clickWheel.style.transform = `scale(${wheelScale})`;
  }

  function toggleFullscreen() {
    const docEl = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen;
      if (req) {
        Promise.resolve(req.call(docEl)).catch(() => {});
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) {
        Promise.resolve(exit.call(document)).catch(() => {});
      }
    }
  }

  window.addEventListener('resize', updateIpodScale);
  document.addEventListener('fullscreenchange', () => {
    updateIpodScale();
    if (state.currentView === 'split' || state.currentView === 'full') {
      renderCurrentMenu();
    }
  });

  function initBatteryMonitor() {
    const batIcon = document.getElementById('battery-icon');
    const batFill = document.getElementById('battery-fill');
    const batBolt = document.getElementById('battery-bolt');
    const batPct = document.getElementById('battery-pct');
    if (!batIcon || !batFill) return;

    let showPct = true;
    let lastPct = 100;
    let isRealBattery = false;

    batIcon.addEventListener('click', () => {
      if (!isRealBattery || !batPct) return;
      showPct = !showPct;
      batPct.textContent = showPct ? `${lastPct}%` : '';
    });

    if (typeof navigator.getBattery !== 'function') {
      batIcon.title = 'Bateria: 100% (API não suportada neste navegador)';
      return;
    }

    navigator.getBattery().then((battery) => {
      isRealBattery = true;
      const updateBatteryUI = () => {
        const level = typeof battery.level === 'number' ? battery.level : 1;
        const pct = Math.max(0, Math.min(100, Math.round(level * 100)));
        const charging = Boolean(battery.charging);
        lastPct = pct;

        batFill.style.width = `${Math.max(6, pct)}%`;
        batFill.classList.remove('warn', 'low');
        if (!charging && pct <= 12) {
          batFill.classList.add('low');
        } else if (!charging && pct <= 25) {
          batFill.classList.add('warn');
        }

        if (batBolt) {
          batBolt.classList.toggle('hidden', !charging);
        }
        if (batPct) {
          batPct.textContent = showPct ? `${pct}%` : '';
        }
        batIcon.title = `Bateria: ${pct}%${charging ? ' (Carregando ⚡)' : ''}`;
      };

      updateBatteryUI();
      battery.addEventListener('levelchange', updateBatteryUI);
      battery.addEventListener('chargingchange', updateBatteryUI);
    }).catch(() => {});
  }

  function initIpod() {
    // Se aberto direto como file:// e o servidor local estiver rodando na porta 3456, redireciona automaticamente
    if (window.location.protocol === 'file:') {
      fetch('http://localhost:3456/api/health', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.ok) {
            window.location.replace('http://localhost:3456/');
          }
        })
        .catch(() => {});
    } else {
      checkProxyServer();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      }
    }

    loadPersistedState();
    applyVisualSettings();
    state.playlist = [...state.songs];
    state.currentTrackIndex = 0;
    updateLibraryStats();
    updateNowPlayingUI();
    updateIpodScale();
    initBatteryMonitor();
    idbRestoreSavedMedia();

    // Inicia o menu raiz na pilha
    state.navStack = [buildRootMenu()];
    renderCurrentMenu();
  }

  initIpod();
})();
