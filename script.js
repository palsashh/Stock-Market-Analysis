const Stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];

const month1 = document.getElementById('oneMon');
const month3 = document.getElementById('threeMon');
const year1 = document.getElementById('oneYr');
const year5 = document.getElementById('fiveYr');
const stockItems = document.getElementById('stockItems');
const stockName = document.getElementById('name');
const stockProfit = document.getElementById('profit');
const bookValue = document.getElementById('bookValue');
const stockInfo = document.getElementById('summary');
const chart = document.getElementById('stockChart');

let currentCompany = "";
let chartId = null;

const monthButtons = [month1, month3, year1, year5];
function handleButtonClick(duration) {
    displayChart(currentCompany, duration);
}
monthButtons.forEach((button) => {
    button.addEventListener("click", function () {
        const selectedDuration = button.value;
        handleButtonClick(selectedDuration);
    });
});

async function getResponse(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not okay');
    }
    return await response.json();
}

async function displayChart(companyName, duration) {
    const stocksResponse = await getResponse('https://stocks3.onrender.com/api/stocks/getstocksdata');
    const timeStamp = stocksResponse.stocksData[0][companyName][duration].timeStamp;
    const dates = timeStamp.map(timestamp => new Date(timestamp * 1000).toLocaleDateString());

    const profitValue = stocksResponse.stocksData[0][companyName][duration].value;
     if (chartId) {
        chartId.destroy(); // Destroy the previous chart instance if it exists
    }

    chartId=new Chart(chart, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label:'Profit',
                fill: false,
                data: profitValue,
                borderColor: 'green',
                pointRadius: 2, // Hide data points
                pointHoverRadius: 5, // Hide data points on hover
                tension:0,
            }],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: false, // Hide x-axis
                },
                y: {
                    display: false, // Hide y-axis
                },
            },
        },
    });
}

async function displaySummary(companyName) {
    const summaryResponsonse = await getResponse('https://stocks3.onrender.com/api/stocks/getstocksprofiledata');
    stockInfo.textContent = summaryResponsonse.stocksProfileData[0][companyName].summary;
    const data = await getStockStactsData(companyName);
    stockName.textContent = companyName;
    bookValue.textContent = '$' + data[0];
    stockProfit.textContent = data[1] + '%';
    if (stockProfit.textContent <= '0.00%') {
        stockProfit.style.color = 'red';
    } else {
        stockProfit.style.color = 'green';
    }
    currentCompany=companyName;

}
async function getStockStactsData(companyName) {
    const stockStatsResponse = await getResponse('https://stocks3.onrender.com/api/stocks/getstockstatsdata');
    const bookedValue = stockStatsResponse.stocksStatsData[0][companyName].bookValue;
    const profitValue = stockStatsResponse.stocksStatsData[0][companyName].profit;
    return [bookedValue, profitValue];
}
async function populateStockList() {
    const stockStatsResponse = await getResponse('https://stocks3.onrender.com/api/stocks/getstockstatsdata');
    Stocks.forEach((item) => {
        const profit = stockStatsResponse.stocksStatsData[0][item].profit;
        const formattedProfit = profit.toFixed(2);
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = item;
        const bookedValue = document.createElement("span");
        bookedValue.textContent = '$' + stockStatsResponse.stocksStatsData[0][item].bookValue;
        const profitValue = document.createElement("span");
        profitValue.textContent = formattedProfit + '%';
        if (profitValue.textContent <= '0.00%') {
            profitValue.style.color = 'red';
        } else {
            profitValue.style.color = 'green';
        }
        listItem.appendChild(button);
        listItem.appendChild(bookedValue);
        listItem.appendChild(profitValue);
        // Append the <li> to the <ul>
        stockItems.appendChild(listItem);

        button.addEventListener("click", function () {
            displayChart(item, '5y');
            displaySummary(item);
        });
    });
}

document.addEventListener('DOMContentLoaded',()=>{
    populateStockList();

    displaySummary('AAPL');
    displayChart('AAPL', "5y");
})
