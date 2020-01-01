const style = document.documentElement.style;

style.setProperty('--primary-color', config.colors.primary);
style.setProperty('--secondary-color', config.colors.secondary);
style.setProperty('--font-color', config.colors.font);
style.setProperty('--countdown-color', config.colors.countdown);
style.setProperty('--background-countdown-color', config.colors.background_countdown);
style.setProperty('--cheese-color', config.colors.cheese);
style.setProperty('--background-default', config.background_image);
style.setProperty('--background-admin', config.background_admin);
style.setProperty('--background-chroma', config.background_chroma);

$(function () {
    $('#wrapper').show();
});
