/**
 * Created by Катэ on 13.11.2015.
 */

function getMessage(a, b) {
    var result;

//  Если первый аргумент, a, имеет тип boolean, то:
//      Если он true, вернуть строку, в которую подставлен параметр b: "Переданное GIF-изображение анимировано и содержит [b] кадров"
//      Если он false, то вернуть строку "Переданное GIF-изображение не анимировано"
    if (typeof a == 'boolean') {
        if (a) {
            result = 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
        }

        else {
            result = 'Переданное GIF-изображение не анимировано';
        }
    }

//Если первый аргумент имеет числовой тип, то вернуть строку:
//  "Переданное SVG-изображение содержит [a] объектов и [b * 4] аттрибутов"
    else if (typeof a == 'number') {
        result = 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + b * 4 + ' аттрибутов';
    }

//Если первый аргумент массив, то вернуть строку:
//  "Количество красных точек во всех строчках изображения: [sum]" где [sum] – это сумма значений переданного массива
    else if (typeof a == 'object' && typeof b !== 'object') {
        var sum = 0;
        for (var i = 0; i < a.length; i++) {
           sum += a[i];
        }
        result = 'Количество красных точек во всех строчках изображения: ' + sum;
    }

//Если оба аргумента массивы, то вернуть строку:
//  "Общая площадь артефактов сжатия: [square] пикселей"
//  где [square] – это сумма произведений соответствующих элементов массивов a и b,
//  cумма произведения первого элемента a с первым элементом b, второго со вторым и так далее
    else if (typeof a == 'object' && typeof b == 'object') {
        var square = 0;
        for (var i = 0; i < a.length; i++) {
            if (i< b.length) {
                square += a[i]*b[i];
            }
        }
        result = 'Общая площадь артефактов сжатия: ' + square + ' пикселей';
    }

    return result;
}
