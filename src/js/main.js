import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'
import filterData from './filter.json';
import Choices from "choices.js";
import IMask from 'imask';
import {Fancybox} from "@fancyapps/ui";
import rangeSlider from 'range-slider-input';


document.addEventListener("DOMContentLoaded", () => {
    function divideNumberByPieces(x, delimiter) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter || " ");
    }

    let itemSliders = [];

    // меню
    document.querySelectorAll('.js--toggle-menu').forEach(item => {
        item.addEventListener("click", () => {
            item.closest('.header').classList.toggle('open');
        })
    })

    // слайдер главная
    if (document.querySelector('.main-slider .swiper')) {
        const swiper = new Swiper('.main-slider .swiper', {
            autoplay: true,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    // селекты
    let selects = {};
    let brandSelect;

    if (document.querySelector('.js--select-style')) {
        document.querySelectorAll('.js--select-style').forEach(item => {
            let selectSearch = true;
            if (item.getAttribute('id') === 'sort') {
                selectSearch = false
            }

            let choices = new Choices(item, {
                allowHTML: true,
                allowHtmlUserInput: true,
                searchEnabled: selectSearch
            });

            if (item.getAttribute('id')) {
                let id = item.getAttribute('id');
                selects[id] = choices;

                if (id === 'sort') {
                    item.addEventListener('choice', (event) => {
                        window.location.href = event.detail.value;
                    })
                }

                if (id === 'brand') {
                    choices.setChoices(filterData['brand'],
                        'value',
                        'label',
                        false
                    )

                    item.addEventListener('choice', (event) => {
                        let value = event.detail.value;
                        selects['model'].clearStore();
                        selects['model'].setValue(filterData[value]);
                        selects['model'].enable();


                        if (document.querySelector('#bodyshell')) {
                            selects['bodyshell'].clearStore();
                            selects['bodyshell'].setValue([{
                                "label": "Выберите кузов",
                                "disabled": "true",
                                "selected": "true"
                            }])
                            selects['bodyshell'].disable();
                        }

                        if (document.querySelector('.page-tradein')) {
                            document.querySelectorAll('.js--choiced-model').forEach(input => {
                                input.value = 'Здесь будет автомобиль 0 ₽'
                            })

                            item.closest('.tabs__content').querySelector('button').setAttribute('disabled', 'true');

                            document.querySelector('.tradein__image img').src = document.querySelector('.tradein__image img').dataset.none
                        }
                    })
                }

                if (id === 'model') {
                    item.addEventListener('choice', (event) => {
                        let brand = selects['brand'].getValue().value;
                        let model = event.detail.value;

                        if (document.querySelector('#bodyshell')) {
                            let bodyshellData = [];
                            filterData[brand].forEach((item) => {
                                if (item.value === model) {
                                    bodyshellData = item.bodyshell
                                }
                            })
                            selects['bodyshell'].clearStore();
                            selects['bodyshell'].setValue(bodyshellData);
                            selects['bodyshell'].enable();
                        }

                        if (document.querySelector('.page-tradein')) {
                            let modelText = '';
                            let price = '';
                            let image = '';

                            filterData[brand].forEach((item) => {
                                if (item.value === model) {
                                    price = item.price
                                    image = item.image
                                }
                            })

                            document.querySelectorAll('.js--choiced-model').forEach(input => {
                                input.value = model + ' ' + price + ' ₽'
                            })

                            document.querySelector('.tradein__image img').src = image

                            item.closest('.tabs__content').querySelector('button').removeAttribute('disabled');
                        }
                    })
                }
            }
        })
    }

    // получение вариантов при работе фильтра
    document.querySelectorAll('.js--get-variants').forEach(input => {
        input.addEventListener('change', (event) => {
            getFilterVariants();
        })
        input.addEventListener('input', (event) => {
            if (input.classList.contains('js--input-number')) {
                input.value != +input.value ? input.value = input.dataset.lastval : input.dataset.lastval = input.value
            }

            getFilterVariants();
        })
    })

    function getFilterVariants() {
        let filter = document.querySelector('.filter');
        let button = filter.querySelector('.button');

        fetch(filter.dataset.url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                brand: filter.querySelector('#brand').value,
                model: filter.querySelector('#model').value,
                min: filter.querySelector('#priceMin').value,
                max: filter.querySelector('#priceMax').value,
            })
        })
            .then(response => response.json())
            .then(data => {
                if (+data.result > 0) {
                    button.removeAttribute('disabled');
                    button.setAttribute('href', data.href);
                    button.textContent = `Показать ${data.result} авто`;
                } else {
                    button.setAttribute('disabled', 'true');
                    button.setAttribute('href', '/');
                    button.textContent = `Ничего не найдено`;
                }
            })
    }

    // очистить фильтр
    if (document.querySelector('.js--clear-filter')) {
        document.querySelector('.js--clear-filter').addEventListener('click', () => {
            let filter = event.target.closest('.filter');
            filter.querySelectorAll('input').forEach(item => {
                item.value = '';
            })

            if (document.querySelector('#brand')) {
                selects['brand'].clearStore();
                selects['brand'].setChoices(filterData['brand'],
                    'value',
                    'label',
                    false
                )
            }
            if (document.querySelector('#model')) {
                selects['model'].clearStore();
                selects['model'].setValue([{"label": "Выберите модель", "disabled": "true", "selected": "true"}])
                selects['model'].disable();
            }
            if (document.querySelector('#bodyshell')) {
                selects['bodyshell'].clearStore();
                selects['bodyshell'].setValue([{"label": "Выберите кузов", "disabled": "true", "selected": "true"}])
                selects['bodyshell'].disable();
            }
            getFilterVariants();
        })
    }

    // показать/скрыть список
    document.querySelectorAll('.js--toggle-hidden').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();

            if (!item.classList.contains('open')) {
                item.classList.add('open');
                item.textContent = item.dataset['hide'];
                item.closest('section').querySelectorAll('.hidden-el').forEach(item => {
                    item.classList.add('visible')
                })
            } else {
                item.classList.remove('open');
                item.textContent = item.dataset['show'];
                item.closest('section').querySelectorAll('.hidden-el').forEach(item => {
                    item.classList.remove('visible')
                })
            }
        })
    })

    // слайдер с товарами
    if (window.innerWidth >= 768) {
        initItemsSliders();
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            initItemsSliders();
        } else {
            removeItemSliders();
        }
    })

    function initItemsSliders() {
        if (document.querySelector('.items .swiper')) {

            document.querySelectorAll('.items .swiper').forEach(slider => {
                const buttonNext = slider.querySelector('.swiper-button-next')
                const buttonPrev = slider.querySelector('.swiper-button-prev')

                const swiper = new Swiper(slider, {
                    loop: false,
                    autoplay: true,
                    slidesPerView: 3,
                    navigation: {
                        nextEl: buttonNext,
                        prevEl: buttonPrev,
                    },
                    breakpoints: {
                        1024: {
                            slidesPerView: 4,
                        },
                    },
                });

                itemSliders.push(swiper)
            })
        }
    }

    function removeItemSliders() {
        itemSliders.forEach(slider => slider.destroy());
        itemSliders = [];
    }

    // форма
    document.querySelectorAll('.js--check-policy').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            event.target.checked ? event.target.closest('form').querySelector('.button').removeAttribute('disabled') : event.target.closest('form').querySelector('.button').setAttribute('disabled', 'true')
        })
    })

    if (document.querySelectorAll('.js--input-phone').length) {
        document.querySelectorAll('.js--input-phone').forEach(input => {
            const mask = IMask(input, {mask: '+{7} (000) 000-00-00'});
        })
    }

    if (document.querySelectorAll('.required').length) {
        document.querySelectorAll('.required').forEach(input => {
            input.addEventListener('focus', (event) => {
                event.target.classList.remove('error')
            })
        })
    }

    document.querySelectorAll('.js--form-send').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            let button = event.target;
            let buttonText = button.innerText;
            let form = button.closest('.main-form');
            let allInputsIsFilled = true;

            form.querySelectorAll('.required').forEach(input => {
                if (input.value.length < 2) {
                    input.classList.add('error');
                    allInputsIsFilled = false
                }
            })

            if (allInputsIsFilled) {
                let formData = new FormData(form);
                let sendingData = {}
                for (let [key, value] of formData) {
                    sendingData[key] = value
                }

                fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sendingData)
                })
                    .then(response => response.json())
                    .then(() => {
                        button.classList.add('sended');
                        button.innerText = 'Отправлено';
                    })
                    .catch(() => {
                        button.innerText = 'Ошибка';
                        setTimeout(() => {
                            button.innerText = buttonText;
                        })
                    })
            }
        })
    })

    Fancybox.bind('[data-fancybox]', {});

    let ranges = {}

    // range slider
    if (document.querySelectorAll('.js--range').length > 0) {
        document.querySelectorAll('.js--range').forEach(range => {
            range.addEventListener('change', (event) => {
                let value = event.target.value;
                let label = event.target.closest('label')

                if (range.getAttribute('id') === 'summ') {
                    label.querySelector('.current-value .value').innerText = divideNumberByPieces(value) + ' ₽';
                    countPercent();
                }

                if (range.getAttribute('id') === 'start') {
                    label.querySelector('.current-value .percent').innerText = value + ' %'
                    countPercent();
                }

                if (range.getAttribute('id') === 'time') {
                    if (value < 12) {
                        label.querySelector('.current-value .value').innerText = value + ' мес'
                    } else {
                        let year = Math.trunc(value / 12);
                        let yearText = '';

                        if (year === 1) {
                            yearText = 'год';
                        } else if (year === 2 || year === 3 || year === 4) {
                            yearText = 'годa';
                        } else {
                            yearText = 'лет';
                        }

                        label.querySelector('.current-value .value').innerText = year + ' ' + yearText + ' ' + (value % 12 > 0 ? (value % 12).toFixed(0) + ' мес' : '');
                    }
                }

                getCalculation();
            })
        })
    }

    function countPercent() {
        let summ = document.querySelector('#summ').value;
        let value = document.querySelector('#start').value;
        let percent = (value * summ / 100).toFixed(0)
        document.querySelector('#start').closest('label').querySelector('.current-value .value').innerText = divideNumberByPieces(percent) + ' ₽'
    }

    function getCalculation() {
        let form = document.querySelector('.calculate__form');

        fetch(form.action, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                summ: form.querySelector('#summ').value,
                start: form.querySelector('#start').value,
                time: form.querySelector('#time').value,
            })
        })
            .then(response => response.json())
            .then(data => {
                form.querySelector('.calculate__right .payment').innerHTML = data.payment + ' ₽'
                form.querySelector('.calculate__right .rate').innerHTML = data.rate + ' %'
            })
    }

    // табы
    document.querySelectorAll('.tabs__caption li:not(.no-tab)').forEach(tab => {
        tab.addEventListener('click', (e) => {

            let tab = e.target.tagName == 'li' ? e.target : e.target.closest('li');

            if (!tab.classList.contains('active')) {
                let nodes = Array.from(tab.closest('ul').children);
                let target = tab.dataset.target;
                let tabIndex = nodes.indexOf(tab);
                let tabContainer = tab.closest('.tabs');
                let tabCaption = tab.closest('ul');

                tabCaption.querySelector('li.active') && tabCaption.querySelector('li.active').classList.remove('active');
                tab.classList.add('active');

                let contentArr = []
                tabContainer.querySelectorAll('.tabs__content').forEach((content, index) => {
                    if (content.dataset.target === target) {
                        content.classList.contains('active') && content.classList.remove('active');
                        contentArr.push(content)
                    }
                })
                contentArr[tabIndex].classList.add('active');

                if (target === 'color') {
                    document.querySelector('.current').innerText = 'Цвет: ' + tab.dataset.color
                }

            }
        })
    })

    // форма tradein переключение вперед/назад
    document.querySelectorAll('.js--switch-tab').forEach(button => {
        button.addEventListener('click', (e) => {
            let button = e.target;
            let target = button.dataset.target;
            let captionEl =  button.closest('.tabs').querySelectorAll('.tabs__caption li')[target];

            captionEl.classList.contains('disabled') && captionEl.classList.remove('disabled');
            captionEl.click();

        })
    })

    // карта
    if(document.querySelector('#map')) {
        ymaps.ready(init);

        function init () {
            var myMap = new ymaps.Map('map', {
                center:[55.699781, 37.619423], // Москва
                zoom:12
            });

            // Создаем метку с помощью вспомогательного класса.
            var myPlacemark1 = new ymaps.Placemark([55.699781, 37.619423], {
                iconContent: '',
            }, {
                preset: 'twirl#violetIcon'
            })

            myMap.geoObjects.add(myPlacemark1)
        }
    }

    document.querySelectorAll('.js--toggle-params').forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.closest('.table__row').classList.toggle('open')
        })
    })
})


