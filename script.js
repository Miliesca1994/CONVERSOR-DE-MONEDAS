// Seleccionamos los elementos del HTML

const monto = document.querySelector("#monto");
const moneda = document.querySelector("#moneda");
const btnBuscar = document.querySelector("#btnBuscar");

const resultado = document.querySelector("#resultado");
const error = document.querySelector("#error");

const canvas = document.querySelector("#myChart");


// Variable para guardar el gráfico

let miGrafico;


// Función principal

async function convertirMoneda() {

    // Limpiamos mensajes anteriores

    resultado.innerHTML = "";
    error.innerHTML = "";


    // Obtenemos los valores del formulario

    const cantidad = Number(monto.value);
    const tipoMoneda = moneda.value;


    // Validamos el monto

    if (cantidad <= 0) {

        error.innerHTML = "Ingresa un monto válido.";

        return;
    }


    // Validamos que se haya seleccionado una moneda

    if (tipoMoneda === "") {

        error.innerHTML = "Selecciona una moneda.";

        return;
    }


    try {

        // Consultamos la API

        const respuesta = await fetch(
            `https://mindicador.cl/api/${tipoMoneda}`
        );


        // Verificamos si la respuesta fue correcta

        if (!respuesta.ok) {

            throw new Error("No se pudo consultar la API.");
        }


        // Convertimos la respuesta a JSON

        const datos = await respuesta.json();


        // Obtenemos el valor actual de la moneda

        const valorMoneda = datos.serie[0].valor;


        // Realizamos la conversión

        const conversion = cantidad / valorMoneda;


        // Mostramos el resultado en el DOM

        resultado.innerHTML = `
            $${cantidad.toLocaleString("es-CL")} CLP =
            $${conversion.toFixed(2)} ${tipoMoneda.toUpperCase()}
        `;


        // Creamos el gráfico con los últimos 10 días

        crearGrafico(datos.serie);


    } catch (e) {

        // Mostramos el error en el DOM

        error.innerHTML =
            "Ocurrió un error al consultar la información. Intenta nuevamente.";

        console.error(e);
    }
}


// Evento del botón

btnBuscar.addEventListener("click", convertirMoneda);


// Función para crear el gráfico

function crearGrafico(serie) {

    // Tomamos solamente los últimos 10 registros

    const ultimos10 = serie.slice(0, 10).reverse();


    // Creamos las fechas

    const fechas = ultimos10.map((dato) => {

        const fecha = new Date(dato.fecha);

        return fecha.toLocaleDateString("es-CL");

    });


    // Obtenemos los valores

    const valores = ultimos10.map((dato) => dato.valor);


    // Si ya existe un gráfico, lo eliminamos

    if (miGrafico) {

        miGrafico.destroy();
    }


    // Creamos el nuevo gráfico

    miGrafico = new Chart(canvas, {

        type: "line",

        data: {

            labels: fechas,

            datasets: [

                {

                    label: "Valor de la moneda",

                    data: valores,

                    borderWidth: 2,

                    tension: 0.3

                }

            ]

        },

        options: {

            responsive: true,

            scales: {

                y: {

                    beginAtZero: false

                }

            }

        }

    });

}