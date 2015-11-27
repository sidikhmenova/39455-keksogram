/**
 * Created by Катэ on 27.11.2015.
 */

'use strict';

(function() {
  var container = document.querySelector('.pictures');

// 1. Перебираем все элементы в структуре данных
  pictures.forEach(function(pictures) {
    var element = getElementFromTemplate(pictures);
    container.appendChild(element);
  });

// 2.Для каждого элемента создаем DOM - элемент на основе шаблона

    /*
     * @param {object} data
     * @return {element}
     * */
  function getElementFromTemplate(data) {
    var template = document.querySelector('#picture-template');
    var element;

    if ('content' in template) {
      element = template.content.children[0].cloneNode(true);
    } else {
      element = template.children[0].cloneNode(true);
    }

    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    /*
    * @type {Image}
    * */
    var backgroundImage = new Image();

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      element.style.backgroundImage = 'url(\'' + backgroundImage.src + '\')';

      //var image = document.createElement('img');
      //image.src = data.url;
      //image.width = 182;
      //image.height = 182;
      //element.replaceChild(image, element.querySelector('img'));
    }

    // Если изображение не загрузилось (404 ошибка, ошибка сервера),
    // показываем сообщение, что у отеля нет фотографий.
    backgroundImage.onerror = function() {
      element.classList.add('picture-load-failure');
    }

    /*
    *@const
    *@type {number}
    * */
    var IMAGE_TIMEOUT = 10000;

    // Установка таймаута на загрузку изображения. Таймер ожидает 10 секунд
    // после которых он уберет src у изображения и добавит класс hotel-nophoto,
    // который показывает, что у отеля нет фотографий.
    var imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = ''; // Прекращаем загрузку
      element.classList.add('picture-load-failure'); // Показываем ошибку
    }, IMAGE_TIMEOUT);

    backgroundImage.src = '/' + data.url;
    backgroundImage.setAttribute('width', '182px');
    backgroundImage.setAttribute('height', '182px');
    element.replaceChild(backgroundImage, element.children[0]);

    return element;
  }

  var filter = document.querySelector('.filters');
  filter.classList.remove('hidden');

})();
