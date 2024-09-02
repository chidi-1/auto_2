import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'
import filterData from './filter.json';

document.addEventListener("DOMContentLoaded", () => {
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
    if (document.querySelector('.js--select-style')) {
        let selects = {}

        document.querySelectorAll('.js--select-style').forEach(item => {
            let choices = new Choices(item, {});

            if (item.getAttribute('id')) {
                let id = item.getAttribute('id')
                selects[id] = choices;

                if (id === 'brand') {
                    item.addEventListener('choice', (event) => {
                        let value = event.detail.value;
                        selects['model'].clearStore();
                        selects['model'].setValue(filterData[value]);
                        selects['model'].enable();
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
    if(window.innerWidth >= 768) {
        initItemsSliders();
    }

    window.addEventListener('resize', () => {
        if(window.innerWidth >= 768) {
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
                    slidesPerView: 3,
                    spaceBetween: 20,
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

    function removeItemSliders () {
        itemSliders.forEach(slider => slider.destroy());
        itemSliders = [];
    }

    // форма
    document.querySelectorAll('.js--check-policy').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            event.target.checked ? event.target.closest('form').querySelector('.button').removeAttribute('disabled') : event.target.closest('form').querySelector('.button').setAttribute('disabled', 'true')
        })
    })

    if(document.querySelectorAll('.js--input-phone').length) {
        document.querySelectorAll('.js--input-phone').forEach(input => {
            const mask = IMask(input, {mask: '+{7} (000) 000-00-00'});
        })
    }

})

