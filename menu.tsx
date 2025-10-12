import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, StyleSheet } from 'react-native';  // Добавьте ImageBackground

interface MenuProps {
  onPlayPress: () => void;
  onFaqPress: () => void;
  onSettingsPress: () => void;  // Добавлено для кнопки настроек
  onExitPress: () => void;  // Добавлено для кнопки выхода
}

export default function Menu({ onPlayPress, onFaqPress, onSettingsPress, onExitPress }: MenuProps) {
  return (
    <ImageBackground 
      source={require('./assets/images/menu_background.png')}  // Путь к вашему фоновому изображению
      style={styles.container}
      resizeMode="cover"  // Или "stretch", в зависимости от дизайна
    >
      {/* Изображение над кнопкой настроек (Engineer из TF2) - теперь кликабельное */}
      <TouchableOpacity style={styles.engineerImageContainer} onPress={onSettingsPress} accessibilityLabel="Настройки">
        <Image
          source={require('./assets/images/engineer.png')}  // Замените на путь к вашему изображению (добавьте файл в assets/images/)
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Уберите backgroundColor, так как теперь используется ImageBackground
  },
  engineerImageContainer: {  // Новый стиль для контейнера изображения (кликабельного)
    position: 'absolute',
    top: 20,  // Позиция сверху
    left: 20,  // Слева
    width: 80,  // Ширина контейнера (соответствует изображению)
    height: 80,  // Высота контейнера (соответствует изображению)
    zIndex: 1,  // Чтобы изображение было поверх других элементов
  },
  engineerImage: {  // Стиль для самого изображения (убран position, так как теперь в контейнере)
    width: '100%',  // Заполняет контейнер
    height: '100%',
  },
  // Убрана кнопка settingsButton и settingsText, так как теперь изображение является кнопкой
  // Остальные стили остаются без изменений
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playImage: {
    width: 100,
    height: 100,
  },
  playText: {
    marginTop: 8,
    fontSize: 20,
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
    width: 50,
    height: 50,
  },
  faqText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  exitButton: {  // Новый стиль для кнопки выхода
    position: 'absolute',
    bottom: 50,  // Увеличено с 20, чтобы сделать выше
    left: 20,
    backgroundColor: '#ddd',  // Добавлен фон для видимости
    padding: 10,  // Добавлен padding для увеличения размера кнопки
    borderRadius: 5,  // Закругление углов
    alignItems: 'center',
  },
  exitText: {  // Новый стиль для текста выхода
    fontSize: 18,  // Увеличен с 16 для большего размера
    fontWeight: '600',
    color: '#000',
  },
});
