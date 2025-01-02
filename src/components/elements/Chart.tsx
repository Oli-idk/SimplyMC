import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Chart, registerables } from 'chart.js';

export default component$(() => {
  const myChart = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (myChart?.value) {
      Chart.register(...registerables);
      new Chart(myChart.value, {
        type: 'doughnut',
        data: {
          labels: [
            'EU Hosting Expenses',
            'US Hosting Expenses',
            'Infrastructure',
            'Platform Development',
            // 'Loan Payments',
            'Client Reimbursements',
            'Hosting Revenue',
            'Ad Revenue',
            // 'Licensing Fees',
            // 'Loans Received',
          ],
          datasets: [{
            // Outer Ring (EXPENDITURES)
            backgroundColor: [
              'rgba(255, 0, 0, 0.2)', // EU Hosting Expenses
              'rgba(255, 50, 0, 0.2)', // US Hosting Expenses
              'rgba(255, 100, 0, 0.2)', // Infra
              'rgba(255, 150, 0, 0.2)', // Dev
              // 'rgba(255, 160, 0, 1)', // loan payments
              'rgba(255, 200, 0, 0.2)', // client reimbursements
              'rgba(0, 200, 0, 0.2)', // hosting revenue
              'rgba(0, 200, 120, 0.2)', // ad revenue
              // 'rgba(0, 210, 100, 1)',
              // 'rgba(0, 215, 150, 1)',
            ],
            borderColor: [
              'rgba(255, 0, 0, 1)', // EU Hosting Expenses
              'rgba(255, 50, 0, 1)', // US Hosting Expenses
              'rgba(255, 100, 0, 1)', // Infra
              'rgba(255, 150, 0, 1)', // Dev
              // 'rgba(255, 160, 0, 1)', // loan payments
              'rgba(255, 200, 0, 1)', // client reimbursements
              'rgba(0, 200, 0, 1)', // hosting revenue
              'rgba(0, 200, 120, 1)', // ad revenue
              // 'rgba(0, 210, 100, 1)',
              // 'rgba(0, 215, 150, 1)',
            ],
            borderWidth: 1,
            data: [923.75, 1780.04, 322.93, 442.68, 1595.40, null, null],
          },
          {
            // Inner Ring (REVENUE)
            backgroundColor: [
              'rgba(255, 0, 0, 0.2)', // EU Hosting Expenses
              'rgba(255, 50, 0, 0.2)', // US Hosting Expenses
              'rgba(255, 100, 0, 0.2)', // Infra
              'rgba(255, 150, 0, 0.2)', // Dev
              // 'rgba(255, 160, 0, 1)', // loan payments
              'rgba(255, 200, 0, 0.2)', // client reimbursements
              'rgba(0, 200, 0, 0.2)', // hosting revenue
              'rgba(0, 200, 120, 0.2)', // ad revenue
              // 'rgba(0, 210, 100, 1)',
              // 'rgba(0, 215, 150, 1)',
            ],
            borderColor: [
              'rgba(255, 0, 0, 1)', // EU Hosting Expenses
              'rgba(255, 50, 0, 1)', // US Hosting Expenses
              'rgba(255, 100, 0, 1)', // Infra
              'rgba(255, 150, 0, 1)', // Dev
              // 'rgba(255, 160, 0, 1)', // loan payments
              'rgba(255, 200, 0, 1)', // client reimbursements
              'rgba(0, 200, 0, 1)', // hosting revenue
              'rgba(0, 200, 120, 1)', // ad revenue
              // 'rgba(0, 210, 100, 1)',
              // 'rgba(0, 215, 150, 1)',
            ],
            borderWidth: 1,
            data: [null, null, null, null, null, 5993.63, 245.85],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: 'white',
                usePointStyle: true,
              },
              position: 'bottom',
              title: {
                display: true,
                text: '',
                color: 'white',
              },
            },
            tooltip: {
              enabled: true,
              cornerRadius: 10,
              padding: 10,
              callbacks: {
                label: function (context) {
                  const label = ' ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(context.parsed);
                  return label;
                },
              },
            },
          },
        },
      });
    }
  });

  return (
    <div>
      <canvas ref={myChart} id="myChart"></canvas>
    </div>
  );
});