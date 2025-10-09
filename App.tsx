import React, { useState, useRef } from 'react'; // Импортируем хуки React для управления состоянием и ссылками
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet, ImageBackground } from 'react-native'; // Импортируем компоненты React Native для UI
import { Video, AVPlaybackStatus } from 'expo-av'; // Импортируем Video и тип AVPlaybackStatus из Expo для воспроизведения видео

// Интерфейс для состояния игры — определяем типы данных для score, multiplier и upgradeCost
interface GameState {
  score: number; // Текущие очки игрока
  multiplier: number; // Множитель клика (сколько очков добавляется за клик)
  upgradeCost: number; // Стоимость следующего апгрейда
}

// Компонент игры — содержит логику клика и апгрейдов
function Game() {
  // Состояние игры с начальными значениями
  const [gameState, setGameState] = useState<GameState>({
    score: 0, // Начинаем с 0 очков
    multiplier: 1, // Множитель по умолчанию x1
    upgradeCost: 10, // Первая стоимость апгрейда — 10 очков
  });

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
      <Text style={styles.memeText}>«Пацаны, не забывайте — MGE братья всегда поддержат!» 😎</Text> {/* Мемный текст */}
    </ImageBackground>
  );
}

// Основной компонент приложения
export default function App() {
  // Состояние для показа интро: true — показываем видео, false — игру
  const [showIntro, setShowIntro] = useState(true);
  // Ссылка на видео для управления им
  const videoRef = useRef<Video>(null);

  // Функция, вызываемая, когда видео заканчивается — переключает на игру
  const onVideoEnd = () => {
    setShowIntro(false); // Скрываем интро, показываем игру
  };

  // Возвращаем JSX: условный рендеринг — видео или игра
  return (
    <View style={styles.container}>
      {showIntro ? ( // Если showIntro true, показываем видео
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
      ) : ( // Если showIntro false, показываем игру
        <Game />
      )}
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
  memeText: { // Стили мемного текста
    fontSize: 16, // Размер
    color: '#ccc', // Серый цвет
    fontStyle: 'italic', // Курсив
    maxWidth: 400, // Максимальная ширина
    textAlign: 'center', // Центрирование текста
  },
});
