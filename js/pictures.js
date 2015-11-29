/**
 * Created by Катэ on 27.11.2015.
 */

'use strict';

(function() {
  var template = document.querySelector('#picture-template');
  var container = document.querySelector('.pictures');
  var filter = document.querySelector('.filters');

  getImages();
  /*
   * Отрисовка изображений
   * @param {Array.<object>} pictures
   * */
  function renderImage(images) {
    images.forEach(function(image) {
      var element = getElementFromTemplate(image);
      container.appendChild(element);
    });
  }

  //Получение списка изображений
  function getImages() {
    // создаем новый xhr запрос
    var xhr = new XMLHttpRequest();
    // указываем, что грузим его с сервера с помощью метода GET
    xhr.open('GET', 'data/pictures.json');
    // ставим обработчик
    xhr.onload = function(evt) {
      // берем данные и парсим их
      var rowData = evt.target.response;
      var loadedImages = JSON.parse(rowData);

      //Обработка загружаемых данных
      renderImage(loadedImages);
    };
    xhr.send();
  }
  /*
    * Для каждого элемента создаем DOM - элемент на основе шаблона
    * @param {object} data
    * @return {element}
  * */
  function getElementFromTemplate(data) {
    var element;
    var IMAGE_TIMEOUT = 10000;

    if ('content' in template) {
      element = template.content.children[0].cloneNode(true);
    } else {
      element = template.children[0].cloneNode(true);
    }

    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    /*
     *@const
     *@type {number}
     * */

    // Установка таймаута на загрузку изображения. Таймер ожидает 10 секунд
    // после которых он уберет src у изображения и добавит класс picture-load-failure,
    // который показывает, что фотография не загрузилась.
    var imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = ''; // Прекращаем загрузку
      element.classList.add('picture-load-failure'); // Показываем ошибку
    }, IMAGE_TIMEOUT);

    /*
    * @type {Image}
    * */
    var backgroundImage = new Image();

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
    };

    // Если изображение не загрузилось (404 ошибка, ошибка сервера),
    // показываем сообщение, что отсутствует изображение
    backgroundImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    backgroundImage.src = data.url;
    backgroundImage.setAttribute('width', '182');
    backgroundImage.setAttribute('height', '182');
    element.replaceChild(backgroundImage, element.children[0]);

    return element;
  }

  filter.classList.remove('hidden');

})();
