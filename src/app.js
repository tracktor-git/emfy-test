const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjRiNTNmMzMwMjA1NDNlYmJmMWUxYTIwMWE3NmFmMjI0YjI0OGQ1NTc5NTVlMzhhMTVjM2RmNDViNDA5M2MwMDYwMTNkMWY1ZWEwZTcwYmEyIn0.eyJhdWQiOiIyYWFmNzJkMi1mYTQyLTRiYmMtOTUwMC1lNmQxMWVmNmEwOWUiLCJqdGkiOiI0YjUzZjMzMDIwNTQzZWJiZjFlMWEyMDFhNzZhZjIyNGIyNDhkNTU3OTU1ZTM4YTE1YzNkZjQ1YjQwOTNjMDA2MDEzZDFmNWVhMGU3MGJhMiIsImlhdCI6MTcyNjIwNjQ1NiwibmJmIjoxNzI2MjA2NDU2LCJleHAiOjE3Mjc2NTQ0MDAsInN1YiI6IjExNTE1MDQ2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTQ5MTEwLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNzM0M2UzNWMtYzVjMy00Mzg5LTkyNmQtMTA3MTA1MjMyNTA2IiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.jO6QmU72Wk2f6YXKMzVlJMIo562OotRuobgWvSwrvF5h7Dnzkxd-el59mBUM3MxbtIcXnAgWMnrOD3kES33cClDGxOiO9vneQDdJGHIBk8K_HC4BclLdaB8s991q3AwoKpx9W_3pGV04T3QL7J-xyc09JfXPvEd-F0kCWUc3o-jq16wNQlPaWGLymFQR9xtd8AnmLOdKVWrFhUvxtC1MnhpgyWSSUen7ja2kM0HE6Kjjjcle2XtbHCpr2yETsPnFu3qskiDJ1L3tyR9spvCwf85p273xKxdrjoERuA1VY4phdORMym9xb2uht6NZAoCbxTVcBPTS3n2yU_EILd7jkA'; // Заменить на реальный токен
const subdomain = 'prtoy';

const fetchOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
};

const getDeals = async (url) => {
  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error('Ошибка при запросе: ' + response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

const getDealInfo = async (id) => {
  try {
    const response = await fetch(`https://${subdomain}.amocrm.ru/api/v4/tasks?filter[entity_id]=${id}&filter[entity_type]=leads`, fetchOptions);
    const data = await response.json();
    return data;
  } catch(error) {
    console.error('Не удалось получить инфу по сделке', error.message);
  }
};

const createStatusCircle = (timestamp) => {
  const currentDate = new Date(); // Текущая дата
  const taskDate = new Date(timestamp); // Дата задачи
  
  let color;

  if (taskDate.toDateString() === currentDate.toDateString()) {
    color = '#34b34a'; // Задача на текущий день
  } else if (taskDate < currentDate) {
    color = 'tomato'; // Задача просрочена
  } else {
    color = '#d7ca2e'; // Задача на будущее
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", 15);  // Размер SVG контейнера
  svg.setAttribute("height", 15);
  svg.style.position = 'relative';
  svg.style.top = '2px';

  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("cx", 7.5);
  circle.setAttribute("cy", 7.5);
  circle.setAttribute("r", 5);
  circle.setAttribute("fill", color);

  svg.appendChild(circle);

  return svg;
}

const createCard = (data) => {
  const card = document.createElement('div');
  card.classList.add('card');

  if (!data) {
    const p = document.createElement('p');
    p.textContent = 'Нет задач для этой сделки...';
    card.append(p);
    return card;
  }

  const { id, title, date } = data;

  const list = document.createElement('ul');
  list.classList.add('card-items');

  const idItem = document.createElement('li');
  idItem.textContent = `ID: ${id}`;

  const titleItem = document.createElement('li');
  titleItem.textContent = `Название задачи: ${title}`;

  const dateItem = document.createElement('li');
  dateItem.textContent = `Дата завершения: ${new Date(Number(date) * 1000).toLocaleDateString()}`;

  const statusItem = document.createElement('li');
  statusItem.textContent = 'Статус:';
  statusItem.appendChild(createStatusCircle(date * 1000));

  list.append(idItem, titleItem, dateItem, statusItem);

  card.append(list);

  return card;
};

const createLoading = () => {
  const loading = document.createElement('div');
  loading.classList.add('loading');
  return loading;
};

const createLoadingCell = () => {
  const loading = createLoading();

  const loadingCell = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = 3;

  td.append(loading);
  loadingCell.append(td);

  return loadingCell;
};

const table = document.querySelector('.cards');
const tableBody = table.querySelector('tbody');

const startUrl = `https://${subdomain}.amocrm.ru/api/v4/leads?page=1&limit=3`;

const loading = createLoadingCell();
tableBody.append(loading);

tableBody.addEventListener('click', async (event) => {
  const tr = event.target.closest('tr');

  document.querySelectorAll('.card').forEach(item => item.remove());

  if (tr) {
    const spinner = createLoading();
    const dealCell = tr.querySelectorAll('td')[1];
    dealCell.append(spinner);

    const data = await getDealInfo(tr.dataset.id);
    const task = data?._embedded?.tasks[0];

    if (!task) {
      const card = createCard(null);
      dealCell.append(card);
      spinner.remove();
      return;
    }

    const cardData = {
      id: task.id,
      title: task.text,
      date: task.complete_till,
    };

    const card = createCard(cardData);
    dealCell.append(card);

    spinner.remove();
  }
});

const appendDeals = async (url) => {
  try {
    const response = await getDeals(url);
    const deals = response._embedded.leads;
    const nextUrl = response._links.next;
  
    deals.forEach((item) => {
      const { id, name, price } = item;
  
      const tr = document.createElement('tr');
      tr.dataset.id = id;
  
      const idTd = document.createElement('td');
      const nameTd = document.createElement('td');
      const priceTd = document.createElement('td');
  
      idTd.classList.add('id');
  
      idTd.textContent = id;
      nameTd.textContent = name;
      priceTd.textContent = price;
  
      tr.append(idTd, nameTd, priceTd);
  
      tableBody.append(tr);
    });

    if (!nextUrl) {
      loading.remove();
      return;
    }
  
    await wait(1000);
    appendDeals(nextUrl.href);
  } catch(error) {
    tableBody.append('Не удалось загрузить сделки:', error.message);
    console.error(error.message);
    loading.remove();
  }
};

appendDeals(startUrl);
