import { LoadingManager } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class AssetsLoadingManager {
  constructor() {
    // Lista de modelos a carregar
    this.assets = {
      models: []
    };

    // Rastreie os modelos carregados
    this.loadedAssets = {
      models: {}
    };

    // Estado do loading
    this.loaded = false;
    this.progress = 0;
    this.itemsLoaded = 0;
    this.itemsTotal = 0;

    this.audioBlocked = true;

    // Detecta se estamos no Vercel
    this.isVercel = this._isVercelEnvironment();
    console.log(`Ambiente detectado: ${this.isVercel ? 'Vercel' : 'Local'}`);

    // Callbacks
    this.onProgress = null;
    this.onLoad = null;
    this.onError = null;

    this.manager = new LoadingManager();
    this.setupLoaders();

    if (typeof window !== 'undefined') {
      window.audioLoadingBlocked = true;
    }
  }

  // Método para detectar ambiente Vercel
  _isVercelEnvironment() {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname.includes('vercel.app') ||
             hostname.includes('.vercel.app');
    }
    return false;
  }

  setupLoaders() {
    // Configura os callbacks do LoadingManager
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.itemsTotal = itemsTotal;
      console.log(`Iniciando carregamento: ${url}, total: ${itemsTotal}`);

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-start', {
        detail: { url, itemsLoaded, itemsTotal }
      }));

      this._blockAudio();

      if (this.onStart) this.onStart(url, itemsLoaded, itemsTotal);
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.itemsLoaded = itemsLoaded;
      this.progress = (itemsLoaded / itemsTotal) * 100;

      console.log(`Progresso: ${Math.round(this.progress)}%, Item: ${url}`);

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-progress', {
        detail: { progress: this.progress, url, itemsLoaded, itemsTotal }
      }));

      if (this.onProgress) this.onProgress(this.progress, url);
    };

    this.manager.onLoad = () => {
      this.loaded = true;
      console.log(`Carregamento completo`);

      window.dispatchEvent(new CustomEvent('loading-complete'));

      // IMPORTANTE: NÃO libera o áudio aqui - isso deve acontecer após interação do usuário

      if (this.onLoad) this.onLoad();
    };

    this.manager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);

      // No ambiente Vercel, tentamos caminhos alternativos se o original falhar
      if (this.isVercel) {
        this._tryAlternativePath(url);
      }

      window.dispatchEvent(new CustomEvent('loading-error', {
        detail: { url }
      }));

      if (this.onError) this.onError(url);
    };

    this.gltfLoader = new GLTFLoader(this.manager);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  // Método para tentar caminhos alternativos quando o original falha
  _tryAlternativePath(originalUrl) {
    console.log(`Tentando caminhos alternativos para: ${originalUrl}`);

    // Encontra o modelo correspondente
    const modelEntry = this.assets.models.find(model => model.url === originalUrl);
    if (!modelEntry) return;

    // Lista de tentativas alternativas
    const alternativePaths = [
      // Remover a barra inicial
      originalUrl.startsWith('/') ? originalUrl.substring(1) : originalUrl,
      // Caminhos relativos
      `./models/${originalUrl.split('/').pop()}`,
      // Apenas o nome do arquivo
      originalUrl.split('/').pop()
    ];

    console.log(`Tentando caminhos alternativos:`, alternativePaths);

    // Tenta cada alternativa, uma por uma
    let attemptIndex = 0;

    const tryNextPath = () => {
      if (attemptIndex >= alternativePaths.length) {
        console.error(`Todas as tentativas falharam para: ${originalUrl}`);
        return;
      }

      const path = alternativePaths[attemptIndex++];
      console.log(`Tentativa ${attemptIndex}/${alternativePaths.length}: ${path}`);

      this.gltfLoader.load(
        path,
        (gltf) => {
          console.log(`Sucesso com caminho alternativo: ${path}`);
          this.loadedAssets.models[modelEntry.name] = gltf;

          // Verifica se todos os modelos estão carregados
          this._checkAllModelsLoaded();
        },
        (xhr) => {
          // Progress callback - ignoramos
        },
        (error) => {
          console.warn(`Falha na alternativa ${attemptIndex}: ${error.message}`);
          // Tenta o próximo caminho
          tryNextPath();
        }
      );
    };

    // Inicia a primeira tentativa
    tryNextPath();
  }

  // Verifica se todos os modelos foram carregados
  _checkAllModelsLoaded() {
    const totalModels = this.assets.models.length;
    const loadedModels = Object.keys(this.loadedAssets.models).length;

    console.log(`Verificando modelos: ${loadedModels}/${totalModels} carregados`);

    // Verifica se todos os modelos estão carregados
    if (loadedModels >= totalModels && !this.loaded) {
      console.log(`Todos os modelos carregados com sucesso!`);
      this.loaded = true;
      window.dispatchEvent(new CustomEvent('loading-complete'));

      if (this.onLoad) this.onLoad();
    }
  }

  _blockAudio() {
    this.audioBlocked = true;

    if (typeof window !== 'undefined') {
      window.audioLoadingBlocked = true;

      if (window.audioManager) {
        if (typeof window.audioManager.stopAllAudio === 'function') {
          window.audioManager.stopAllAudio();
        }

        if (window.audioManager.isLoadingComplete !== undefined) {
          window.audioManager.isLoadingComplete = false;
        }
      }
    }
  }

  _unblockAudio() {
    this.audioBlocked = false;

    if (typeof window !== 'undefined') {
      window.audioLoadingBlocked = false;

      if (window.audioManager) {
        if (typeof window.audioManager.notifyLoadingComplete === 'function') {
          window.audioManager.notifyLoadingComplete();
        } else {
          window.audioManager.isLoadingComplete = true;
        }
      }
    }
  }

  addModel(url, name) {
    // CORREÇÃO PARA VERCEL: Ajusta o caminho automaticamente para o Vercel
    let fixedUrl = url;
    if (this.isVercel && url.startsWith('/')) {
      // No Vercel, remova a barra inicial para usar caminhos relativos
      fixedUrl = url.substring(1);
      console.log(`URL ajustada para Vercel: ${url} -> ${fixedUrl}`);
    }

    this.assets.models.push({ url: fixedUrl, name });
    return this;
  }

  startLoading() {
    console.log(`Iniciando carregamento de ${this.assets.models.length} modelos`);

    // Log de todos os modelos que tentaremos carregar
    console.table(this.assets.models.map(m => ({ nome: m.name, url: m.url })));

    this._blockAudio();

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    }

    if (this.assets.models.length === 0) {
      setTimeout(() => {
        this.loaded = true;
        window.dispatchEvent(new CustomEvent('loading-complete'));
        if (this.onLoad) this.onLoad();
        // NOTA: Ainda mantém o áudio bloqueado até interação do usuário
      }, 500);
      return;
    }

    // Carrega todos os modelos
    this.assets.models.forEach(model => {
      console.log(`Carregando modelo: ${model.name} (${model.url})`);

      this.gltfLoader.load(
        model.url,
        (gltf) => {
          console.log(`Modelo carregado com sucesso: ${model.name}`);
          this.loadedAssets.models[model.name] = gltf;

          // Verifica se todos os modelos foram carregados
          this._checkAllModelsLoaded();
        },
        // Callback de progresso
        (xhr) => {
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(`${model.name}: ${Math.round(percentComplete)}% carregado`);
          }
        },
        // Callback de erro
        (error) => {
          console.error(`Erro ao carregar modelo ${model.name}:`, error);

          // Se estamos no Vercel e houve erro, não tentamos de novo aqui
          // O callback de erro do manager já vai chamar _tryAlternativePath
        }
      );
    });

    // Adiciona timeout de segurança para forçar a conclusão após 15 segundos
    setTimeout(() => {
      if (!this.loaded) {
        console.warn('Forçando conclusão do carregamento após timeout');
        console.warn('Modelos carregados:', Object.keys(this.loadedAssets.models));

        // Mesmo com erros, vamos seguir em frente
        this.loaded = true;

        // Dispara eventos de conclusão
        window.dispatchEvent(new CustomEvent('loading-complete'));

        if (this.onLoad) this.onLoad();
      }
    }, 15000);
  }

  handleUserInteraction() {
    this.loaded = true;

    this._unblockAudio();

    console.log('AssetsLoadingManager: Áudio liberado após interação do usuário');
    return true;
  }

  getModel(name) {
    return this.loadedAssets.models[name];
  }

  isLoaded() {
    return this.loaded;
  }

  isAudioBlocked() {
    return this.audioBlocked;
  }

  // NOVO: Método para forçar conclusão do carregamento (útil em caso de erros)
  forceComplete() {
    if (!this.loaded) {
      console.warn('Forçando conclusão do carregamento manualmente');
      this.loaded = true;
      window.dispatchEvent(new CustomEvent('loading-complete'));
      if (this.onLoad) this.onLoad();
    }
  }
}

export default AssetsLoadingManager;