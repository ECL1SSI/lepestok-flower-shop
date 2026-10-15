export const availabilityOptions=['В наличии','Под заказ','Доступен к повтору','Нет в наличии'];
export function availability(p:any):string{return p.available===false?'Нет в наличии':availabilityOptions.includes(p.availability)?p.availability:'В наличии'}
export const availabilityHelp:Record<string,string>={
 'В наличии':'Букет доступен к оформлению. Дату и время подтвердит флорист.',
 'Под заказ':'Сборка после согласования состава и даты с флористом.',
 'Доступен к повтору':'Повторим настроение композиции. Сезонный состав и дату согласуем с вами.',
 'Нет в наличии':'Этот вариант пока недоступен. Можно сохранить его в избранном.'
};
