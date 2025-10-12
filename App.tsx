import React, { useState, useRef, useEffect } from 'react'; // Добавлен useEffect для сохранения/загрузки и музыки
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet, ImageBackground, ScrollView, BackHandler } from 'react-native'; // Добавлен BackHandler для нормального выхода
import { Video, AVPlaybackStatus, Audio } from 'expo-av'; // Добавлен Audio для музыки
import AsyncStorage from '@react-native-async-storage/async-storage'; // Добавлен импорт AsyncStorage для сохранения данных
import Slider from '@react-native-community/slider'; // Добавлен для ползунка громкости

// Интерфейс для состояния игры — определяем типы данных для score, multiplier и upgradeCost
interface GameState {
  score: number; // Текущие очки игрока
  multiplier: number; // Множитель клика (сколько очков добавляется за клик)
  upgradeCost: number; // Стоимость следующего апгрейда
}

// Компонент игры — содержит логику клика и апгрейдов
function Game({ volume, onBackToMenu }: { volume: number; onBackToMenu: () => void }) { // Добавлен пропс onBackToMenu
  // Ключ для хранения данных в AsyncStorage (уникальный для вашей игры)
  const STORAGE_KEY = 'mgeClickerGameData';

  // Состояние игры с начальными значениями
  const [gameState, setGameState] = useState<GameState>({
    score: 0, // Начинаем с 0 очков
    multiplier: 1, // Множитель по умолчанию x1
    upgradeCost: 10, // Первая стоимость апгрейда — 10 очков
  });

  // Ссылка на звук для игры
  const gameMusicRef = useRef<Audio.Sound | null>(null);

  // Функция сохранения данных в AsyncStorage
  const saveGameData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      console.log('Данные сохранены');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  // Функция загрузки данных из AsyncStorage
  const loadGameData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData !== null) {
        const parsedData: GameState = JSON.parse(storedData);
        setGameState(parsedData);
        console.log('Данные загружены');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  // Загружаем данные при запуске компонента Game
  useEffect(() => {
    loadGameData();
  }, []);

  // Сохраняем данные при каждом изменении gameState
  useEffect(() => {
    saveGameData();
  }, [gameState]);

  // Загружаем музыку один раз при монтировании
  useEffect(() => {
    const loadGameMusic = async () => {
      if (!gameMusicRef.current) {
        try {
          const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/game_music.mp3')); // Путь к музыке игры (добавьте файл в assets/sounds/)
          gameMusicRef.current = sound;
          await sound.setVolumeAsync(volume); // Устанавливаем громкость из настроек
          await sound.setIsLoopingAsync(true); // Зацикливаем музыку
          await sound.playAsync(); // Воспроизводим
        } catch (error) {
          console.error('Ошибка загрузки музыки игры:', error);
        }
      }
    };
    loadGameMusic();

    // Останавливаем музыку при размонтировании компонента
    return () => {
      if (gameMusicRef.current) {
        gameMusicRef.current.unloadAsync();
      }
    };
  }, []); // Загружаем только один раз при монте

  // Обновляем громкость при изменении volume
  useEffect(() => {
    if (gameMusicRef.current) {
      gameMusicRef.current.setVolumeAsync(volume);
    }
  }, [volume]);

  // Функция, вызываемая при клике на изображение — увеличивает очки на значение множителя
  const handleClick = () => {
    setGameState(prev => ({
      ...prev, // Сохраняем предыдущее состояние
      score: prev.score + prev.multiplier, // Добавляем очки с учётом множителя
    }));
  };

  // Функция апгрейда — проверяет, хватает ли очков, и повышает множитель
  const handleUpgrade = () => {
    if (gameState.score >= gameState.upgradeCost) { // Если очков хватает
      const newMultiplier = gameState.multiplier + 1; // Новый множитель +1
      const newUpgradeCost = Math.floor(gameState.upgradeCost * 1.5); // Новая стоимость увеличивается на 50%
      setGameState({
        score: gameState.score - gameState.upgradeCost, // Вычитаем стоимость из очков
        multiplier: newMultiplier, // Устанавливаем новый множитель
        upgradeCost: newUpgradeCost, // Устанавливаем новую стоимость
      });
      Alert.alert('Апгрейд!', `Множитель теперь x${newMultiplier}! МГЕ братья не подведут!`); // Уведомление об успехе
    } else {
      Alert.alert('Недостаточно очков!', 'Собирай больше, брат!'); // Уведомление, если очков не хватает
    }
  };

  // Возвращаем JSX для отображения игры
  return (
    <ImageBackground source={require('./assets/images/mge_2.png')} style={styles.gameContainer}>
      <Text style={styles.title}>МГЕ Братья Кликер</Text> {/* Заголовок игры */}
      <TouchableOpacity onPress={handleClick} accessibilityLabel="Кликни, чтобы собрать очки!">
        {/* Кнопка-клик: изображение, по которому можно кликать */}
        <Image
          source={require('./assets/images/mge_1.png')} // Путь к изображению для клика (ваш файл)
          style={styles.clickImage}
          resizeMode="contain"
          accessibilityLabel="Изображение для клика"
        />
      </TouchableOpacity>
      <Text style={styles.scoreText}>Очки: {gameState.score}</Text> {/* Отображение текущих очков */}
      <Text style={styles.multiplierText}>Множитель: x{gameState.multiplier}</Text> {/* Отображение множителя */}
      <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} accessibilityLabel="Кнопка апгрейда">
        {/* Кнопка апгрейда */}
        <Text style={styles.upgradeText}>Апгрейд (Стоимость: {gameState.upgradeCost})</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backToMenuButton} onPress={onBackToMenu} accessibilityLabel="В меню">
        <Text style={styles.backToMenuText}>В меню</Text>
      </TouchableOpacity>
      <Text style={styles.memeText}>«Алексей ебал гусей» 😎</Text> {/* Мемный текст */}
    </ImageBackground>
  );
}

// Компонент меню
function Menu({ onPlayPress, onFaqPress, onExitPress, onSettingsPress, volume, menuMusicRef }: { onPlayPress: () => void; onFaqPress: () => void; onExitPress: () => void; onSettingsPress: () => void; volume: number; menuMusicRef: React.RefObject<Audio.Sound | null> }) { // Добавлен пропс menuMusicRef
  // Обновляем громкость при изменении volume
  useEffect(() => {
    if (menuMusicRef.current) {
      menuMusicRef.current.setVolumeAsync(volume);
    }
  }, [volume]);

  return (
    <ImageBackground source={require('./assets/images/menu_background.png')} style={styles.menuContainer}>
      {/* Изображение над кнопкой настроек (Engineer из TF2) - теперь кликабельное */}
      <TouchableOpacity style={styles.engineerImageContainer} onPress={onSettingsPress} accessibilityLabel="Настройки">
        <Image
          source={require('./assets/images/engineer.png')} // Замените на путь к вашему изображению (добавьте файл в assets/images/)
          style={styles.engineerImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Кнопка Играть по центру */}
      <TouchableOpacity style={styles.playButton} onPress={onPlayPress} accessibilityLabel="Играть">
        <Image source={require('./assets/images/play.png')} style={styles.playImage} resizeMode="contain" />
        <Text style={styles.playText}>Играть</Text>
      </TouchableOpacity>

      {/* Кнопка FAQ внизу справа */}
      <TouchableOpacity style={styles.faqButton} onPress={onFaqPress} accessibilityLabel="FAQ">
        <Image source={require('./assets/images/faq.png')} style={styles.faqImage} resizeMode="contain" />
        <Text style={styles.faqText}>FAQ</Text>
      </TouchableOpacity>

      {/* Кнопка выхода внизу слева */}
      <TouchableOpacity style={styles.exitButton} onPress={onExitPress} accessibilityLabel="Выход">
        <Text style={styles.exitText}>Выход</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

// Компонент настроек
function Settings({ onBackPress, volume, setVolume }: { onBackPress: () => void; volume: number; setVolume: (v: number) => void }) {
  const saveVolume = async (newVolume: number) => {
    setVolume(newVolume);
    try {
      await AsyncStorage.setItem('volume', newVolume.toString());
    } catch (e) {
      console.error('Ошибка сохранения громкости:', e);
    }
  };

  const resetProgress = () => {
    Alert.alert('Сброс', 'Вы уверены? Прогресс будет потерян.', [
      { text: 'Отмена' },
      { text: 'Сбросить', onPress: async () => {
        try {
          // Воспроизводим звук сброса
          const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/suka_chto_tvorish.mp3')); // Путь к звуку сброса (добавьте файл в assets/sounds/)
          await sound.setVolumeAsync(volume); // Устанавливаем громкость из настроек
          await sound.playAsync(); // Воспроизводим звук
          // Не unload, чтобы звук проиграл; если нужно, добавьте setTimeout для unload
          
          // Сбрасываем данные
          await AsyncStorage.removeItem('mgeClickerGameData');
          Alert.alert('Сброшено!', 'Прогресс очищен.');
        } catch (e) {
          console.error('Ошибка сброса:', e);
        }
      }}
    ]);
  };

  return (
    <ImageBackground source={require('./assets/images/settings_background.png')} style={styles.settingsContainer}> {/* Замените путь на ваше фоновое изображение */}
      {/* Убрали settingsOverlay — теперь содержимое напрямую в ImageBackground */}
      <Text style={styles.settingsTitle}>Настройки</Text>

      <View style={styles.volumeSection}>
        <Text style={styles.volumeLabel}>Громкость звука</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onSlidingComplete={saveVolume}
          minimumTrackTintColor="#2196F3"
          maximumTrackTintColor="#000000"
          thumbTintColor="#2196F3"
        />
        <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetProgress}>
        <Text style={styles.buttonText}>Сброс прогресса</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Text style={styles.buttonText}>Назад</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

// Компонент FAQ
function FAQ({ onBackPress }: { onBackPress: () => void }) {
  return (
    <ImageBackground source={require('./assets/images/faq_face.png')} style={styles.faqContainer}>
      <ScrollView contentContainerStyle={styles.faqScrollContainer}>
        <Text style={styles.faqTitle}>Часто задаваемые вопросы (FAQ)</Text>
        <Text style={styles.question}>Вопрос 1: Как играть?</Text>
        <Text style={styles.answer}>Просто нажимайте на кнопку "Играть" и собирайте очки!</Text>
        <Text style={styles.question}>Вопрос 2: Как улучшать?</Text>
        <Text style={styles.answer}>Используйте очки для апгрейдов множителя.</Text>
        <Text style={styles.question}>Вопрос 3: Что такое МГЕ братья?</Text>
        <Text style={styles.answer}>Это мемная тема игры, где братья поддерживают тебя в кликере!</Text>
        {/* Добавьте свои вопросы и ответы */}
        <TouchableOpacity style={styles.backButton} onPress={onBackPress} accessibilityLabel="Назад в меню">
          <Text style={styles.backText}>Назад в меню</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

// Основной компонент приложения
export default function App() {
  // Состояние для экранов: intro, menu, game, faq, settings
  const [screen, setScreen] = useState<'intro' | 'menu' | 'game' | 'faq' | 'settings'>('intro');
  // Состояние для громкости
  const [volume, setVolume] = useState<number>(0.5);
  // Ссылка на видео для управления им
  const videoRef = useRef<Video>(null);
  // Ссылка на музыку меню (загружается один раз за сессию приложения)
  const menuMusicRef = useRef<Audio.Sound | null>(null);
  // Флаг, чтобы музыка меню играла только один раз за сессию
  const [menuMusicPlayed, setMenuMusicPlayed] = useState<boolean>(false);

  // Инициализируем Audio режим при запуске приложения
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        });
        console.log('Audio режим инициализирован');
      } catch (error) {
        console.error('Ошибка инициализации Audio:', error);
      }
    };
    initAudio();
  }, []);

  // Загружаем громкость при запуске
  useEffect(() => {
    const loadVolume = async () => {
      try {
        const savedVolume = await AsyncStorage.getItem('volume');
        if (savedVolume !== null) {
          setVolume(parseFloat(savedVolume));
        }
      } catch (e) {
        console.error('Ошибка загрузки громкости:', e);
      }
    };
    loadVolume();
  }, []);

  // Загружаем музыку меню один раз при запуске приложения (без воспроизведения)
  useEffect(() => {
    const loadMenuMusic = async () => {
      if (!menuMusicRef.current) {
        try {
          const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/menu_music.mp3')); // Путь к музыке меню (добавьте файл в assets/sounds/)
          menuMusicRef.current = sound;
          await sound.setVolumeAsync(volume); // Устанавливаем громкость из настроек
          await sound.setIsLoopingAsync(false); // Не зацикливаем музыку
          menuMusicRef.current = sound;
        } catch (error) {
          console.error('Ошибка загрузки музыки меню:', error);
        }
      }
    };
    loadMenuMusic();
  }, []); // Загружаем только один раз при запуске приложения

  // Управляем воспроизведением музыки меню в зависимости от screen
  useEffect(() => {
    const handleMenuMusic = async () => {
      if (menuMusicRef.current) {
        if (screen === 'menu') {
          // Если в меню и музыка ещё не играла за сессию, играем
          if (!menuMusicPlayed) {
            try {
              await menuMusicRef.current.playAsync();
              setMenuMusicPlayed(true);
            } catch (error) {
              console.error('Ошибка воспроизведения музыки меню:', error);
            }
          }
        } else {
          // Если не в меню, останавливаем музыку
          try {
            await menuMusicRef.current.pauseAsync();
          } catch (error) {
            console.error('Ошибка остановки музыки меню:', error);
          }
        }
      }
    };
    handleMenuMusic();
  }, [screen, menuMusicPlayed]);

  // Функция, вызываемая, когда видео заканчивается — переключает на меню
  const onVideoEnd = () => {
    setScreen('menu');
  };

  // Функция выхода — используем BackHandler для нормального выхода из приложения
  const handleExit = () => {
    Alert.alert('Выход', 'Ты действительно хочешь выйти, сосунок?', [
      { text: 'Вернуться тапать' },
      { text: 'Я больше не могу', onPress: () => BackHandler.exitApp() }, // Нормальный выход
    ]);
  };

  // Возвращаем JSX: условный рендеринг — видео, меню, игра, настройки или FAQ
  return (
    <View style={styles.container}>
      {screen === 'intro' && (
        <Video
          ref={videoRef} // Ссылка на видео для контроля
          source={require('./assets/images/logo.mp4')} // Путь к вашему интро-видео с логотипом и звуком
          style={styles.video} // Стили для видео (полный экран)
          resizeMode="contain" // Видео вписывается в контейнер без обрезки
          shouldPlay // Автоматически запускаем видео при загрузке
          isMuted={false} // Включаем звук во время интро
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => { // Обработчик обновления статуса воспроизведения с типизацией
            if (status.didJustFinish) { // Если видео закончилось
              onVideoEnd(); // Вызываем функцию окончания
            }
          }}
        />
      )}
      {screen === 'menu' && (
        <Menu
          onPlayPress={() => setScreen('game')}
          onFaqPress={() => setScreen('faq')}
          onExitPress={handleExit}
          onSettingsPress={() => setScreen('settings')}
          volume={volume} // Передаём volume в Menu
          menuMusicRef={menuMusicRef} // Передаём ссылку на музыку меню
        />
      )}
      {screen === 'game' && <Game volume={volume} onBackToMenu={() => setScreen('menu')} />}
      {screen === 'settings' && <Settings onBackPress={() => setScreen('menu')} volume={volume} setVolume={setVolume} />}
      {screen === 'faq' && <FAQ onBackPress={() => setScreen('menu')} />}
    </View>
  );
}

// Стили для компонентов — определяют внешний вид
const styles = StyleSheet.create({
  container: { // Основной контейнер приложения
    flex: 1, // Занимает весь экран
    backgroundColor: 'black', // Чёрный фон
  },
  video: { // Стили для видео
    flex: 1, // Занимает весь контейнер
    width: '100%', // Полная ширина
    height: '100%',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  engineerImageContainer: {  // Новый стиль для контейнера изображения (кликабельного)
    position: 'absolute',
    top: 20,  // Позиция сверху
    left: 20,  // Слева
    width: 80,  // Ширина контейнера (соответствует изображению)
    height: 80,  // Высота контейнера (соответствует изображению)
    zIndex: 1,  // Чтобы изображение было поверх других элементов
  },
  engineerImage: {  // Стиль для самого изображения (убран position, width и height, так как теперь в контейнере)
    width: '100%',  // Заполняет контейнер
    height: '100%',
  },
  // Убрана settingsButton и settingsText, так как изображение теперь является кнопкой
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playImage: {
    width: 150, // Увеличено с 100
    height: 150, // Увеличено с 100
  },
  playText: {
    marginTop: 8,
    fontSize: 26, // Увеличено до 26 px, как запрошено
    fontWeight: 'bold',
    color: '#000',
  },
  faqButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  faqImage: {
    width: 80, // Увеличено с 50
    height: 80, // Увеличено с 50
  },
  faqText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  exitButton: {
    position: 'absolute',
    bottom: 50, // Увеличено с 20, чтобы сделать выше
    left: 20,
    backgroundColor: '#ddd', // Добавлен фон для видимости
    padding: 10, // Добавлен padding для увеличения размера кнопки
    borderRadius: 5, // Закругление углов
    alignItems: 'center',
  },
  exitText: {
    fontSize: 18, // Увеличен с 16 для большего размера
    fontWeight: '600',
    color: '#000',
  },
  settingsContainer: { // Контейнер для настроек теперь ImageBackground
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    color: '#fff', // Белый цвет для читаемости на фоне (оставляем, чтобы текст был виден)
    fontWeight: 'bold',
  },
  volumeSection: {
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  volumeLabel: {
    fontSize: 18,
    marginBottom: 10,
    color: '#fff', // Белый для читаемости
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  volumeText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff', // Белый для читаемости
  },
  resetButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '80%',
  },
  backButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  faqContainer: { 
    flex: 1,
  },
  faqScrollContainer: { 
    padding: 20, 
    flexGrow: 1,
  },
  faqTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#ff6f00', // Изменён на оранжевый цвет
  },
  question: { 
    fontSize: 20, 
    fontWeight: '600', 
    marginTop: 15,
    color: '#fff', // Изменён на белый для лучшей читаемости
  },
  answer: { 
    fontSize: 16, 
    marginTop: 5, 
    color: '#ddd', // Изменён на светло-серый для лучшей читаемости (был '#555')
  },
  backText: {
    fontSize: 18,
    color: '#000',
  },
  gameContainer: { // Контейнер игры
    flex: 1, // Занимает весь экран
    justifyContent: 'center', // Центрируем содержимое вертикально
    alignItems: 'center', // Центрируем содержимое горизонтально
    padding: 40, // Отступы
  },
  title: { // Стили заголовка
    fontSize: 36, // Размер шрифта
    fontWeight: 'bold', // Жирный
    marginBottom: 25, // Отступ снизу
    color: '#ff6f00', // Оранжевый цвет
    textShadowColor: '#000', // Тень
    textShadowOffset: { width: 2, height: 2 }, // Смещение тени
    textShadowRadius: 4, // Размытие тени
  },
  clickImage: { // Стили изображения для клика
    width: 160, // Ширина
    height: 160, // Высота
    marginBottom: 25, // Отступ снизу
  },
  scoreText: { // Стили текста очков
    fontSize: 26, // Размер
    marginBottom: 8, // Отступ
    color: '#fff', // Белый цвет
    textShadowColor: '#000', // Тень
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  multiplierText: { // Стили текста множителя
    fontSize: 20,
    marginBottom: 20,
    color: '#ddd', // Светло-серый
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  upgradeButton: { // Стили кнопки апгрейда
    backgroundColor: '#ff4500', // Красный фон
    paddingVertical: 15, // Вертикальный отступ
    paddingHorizontal: 30, // Горизонтальный отступ
    borderRadius: 12, // Закругление углов
    marginBottom: 20, // Отступ снизу
    shadowColor: '#ff4500', // Тень цвета кнопки
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, // Полная непрозрачность тени
    shadowRadius: 10, // Размытие тени
  },
  upgradeText: { // Стили текста кнопки
    color: 'white', // Белый цвет
    fontSize: 20, // Размер
    fontWeight: '700', // Жирный
  },
  backToMenuButton: { // Новый стиль для кнопки "В меню"
    backgroundColor: '#2196F3', // Синий фон, как у других кнопок
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10, // Отступ перед мемным текстом
  },
  backToMenuText: { // Стили текста для кнопки "В меню"
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  memeText: { // Стили мемного текста
    fontSize: 16, // Размер
    color: '#ccc', // Серый цвет
    fontStyle: 'italic', // Курсив
    maxWidth: 400, // Максимальная ширина
    textAlign: 'center', // Центрирование текста
  },
});
