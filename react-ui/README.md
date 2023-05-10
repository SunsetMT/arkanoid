# Arkanoid React


##  Settings & Variables Used From localStorage

### Setting's Keys
#### Все настройки по умолчанию прописаны в файле src/utils/settings/default-settings.ts
```
lives // Количество жизней
time // Время матча
maxCubes // Максимальное количество блоков
minCubes // Минимальное количество блоков
durability // Максимальная прочность блоков
startSpeed // Начальная скорость шара
bonusChance // Шанс выпадения бонуса
bonusCount // Максимальное количество бонусов
debuffChance // Шанс выпадения дебаффа
debuffCount // Максимальное количество дебаффов
rebound // Коэффициент отскока шара
paddleSize // Размер платформы
speedBonus // Значение в процентах, на которое растет скорость шара
showBonus // Показывать/скрывать бонусы
advancedGen // Продвинутая генерация
difficulty // Сложность
```

### Game Result Keys
#### Значения на момент конца игры
#### Логика определения результата в файле src/utils/game-result/get-game-result.ts
```
timeLeft // Время, оставшееся до конца матча
playerBlocks // Оставшиеся блоки игрока
playerLives // Оставшиеся жизни игрока
playerScore // Финальный счет игрока
opponentBlocks // Оставшиеся блоки противника
opponentLives // Оставшиеся жизни противника
opponentScore // Финальный счет противника
```