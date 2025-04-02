const readline = require("readline");
const fileSystem = require("fs");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

const leitor = readline.createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
);

const programaPrincipal = () => {
    leitor.question(
        "\nDigite o caminho do arquivo [exemplo.txt]: ", (caminhoArquivo)=>{
            const caminhoArquivoTratado = caminhoArquivo
                .replaceAll(" ", "")
                .replace(",", ".")
                .toLowerCase()
                .trim()

                console.time("--> Tempo de duração da execução do programa");

            const lerArquivo = async () => {
               await fileSystem.readFile(
                caminhoArquivoTratado, "utf-8", (erro, dados) => {
                    if(erro){
                        console.log("---> erro, arquivo não encontrado!");
                        leitor.close();
                        return;
                    }
                    const linhasArquivo = dados.split(/\r?\n/);
                    let totalLinhasSomenteNumero = 0;
                    let totalSomenteNumerosNaLinha = 0;
                    let totalLinhasTexto = 0;
                    let numerosArquivo = [];
                    let somaNumeros = 0;

                    for(let i = 0; i < linhasArquivo.length; i++){
                        const stringPossuiSomenteNumero = /^\d+$/.test(linhasArquivo[i]);
                        const stringNaoPossuiSomenteNumero = !(/^\d+$/.test(linhasArquivo[i]));

                        if (stringPossuiSomenteNumero){
                            totalLinhasSomenteNumero++;
                            totalSomenteNumerosNaLinha += Number(linhasArquivo[i]);
                        }

                        if(stringNaoPossuiSomenteNumero){
                            totalLinhasTexto++;
                        } 
                        numerosArquivo.push(
                            Number(linhasArquivo[i].replace(/[^0-9]/g, "")));
                }

                 somaNumeros = numerosArquivo.reduce(
                    (acumulador, valor) => {
                        return acumulador + valor} 
                 );

                 const resumo = {
                    totalLinhasSomenteNumero,
                    totalSomenteNumerosNaLinha,
                    totalLinhasTexto,
                    somaNumeros,
                    caminhoArquivoTratado,
                 };

                 eventEmitter.emit(
                    "exibirResumo", resumo
                 );


                 console.timeEnd("--> Tempo de duração da execução do programa");

                 solicitarPerguntaNovaExecucao();
                
                }
                           
               );
            };

            lerArquivo();
        }
    );
};

const exibirResumo = (resumo) =>{
    console.log(`\n--> Resumo do arquivo ${resumo.caminhoArquivoTratado}`);

    console.table(
        [
            ["Total de linhas que possuem somente números", resumo.totalLinhasSomenteNumero],
            ["Total da soma dos números destas linhas", resumo.totalSomenteNumerosNaLinha],
            ["Total de linhas que possuem texto", resumo.totalLinhasTexto],
            ["Total da soma dos números do arquivo", resumo.somaNumeros],

        ]
    );
};

const solicitarPerguntaNovaExecucao = ()=>{
    leitor.question(
        "\nQuer executar novamente [S/N]?", (resposta) => {
            const respostaTratada = resposta
            .replaceAll(" ", "")
            .replace(/[0-9]/g, "")
            .toUpperCase()
            .trim()
            .charAt(0)

            if(respostaTratada == "S"){
                eventEmitter.emit("recebeuRespostaSim");
            } else if(respostaTratada == "N"){
                eventEmitter.emit("recebeuRespostaNao");
            } else {
                eventEmitter.emit("recebeuRespostaInvalida")
            }
        }
    );
}

const processarRespostaNao = ()=>{
    console.log("Programa Finalizado");
    leitor.close()
}

const processarRespostaInvalida = ()=>{
    console.log("Responda somente [S/N]")
    solicitarPerguntaNovaExecucao();
}

eventEmitter.on(
    "exibirResumo", (resumo)=>{
        exibirResumo(resumo);
    }
);

eventEmitter.on(
    "recebeuRespostaSim", ()=>{
        programaPrincipal();
    }
);

eventEmitter.on(
    "recebeuRespostaNao", ()=>{
        processarRespostaNao()
    }
);

eventEmitter.on(
    "recebeuRespostaInvalida", ()=>{
        processarRespostaInvalida();
    }
)



programaPrincipal();