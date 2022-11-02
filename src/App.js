import React, { useCallback, useEffect, useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Button, Grid, LinearProgress, TextField } from "@mui/material";


const columns = [
  { id: "cliente", label: "Documento del cliente"},
  { id: "nombre_cliente", label: "Nombre del cliente"},
  { id: "date", label: "Fecha"},
  { id: "direccion_entrega", label: "Dirección de entrega"},
  { id: "numero_impresiones", label: "Cantidad de impresiones"},
  { id: "actions", label: "Acciones"},
];

function App() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toEmails, setToEmails] = useState("");

  useEffect(() => {
    fetch("https://backend-nodejs-kh3l4wjf6q-uc.a.run.app/pedido")
    .then(r => r.json())
    .then(data => {
      const parsedInfo = data.orders.map(order => ({
        "id": order.id,
        "cliente": order.cliente.id,
        "nombre_cliente": order.cliente.nombre,
        "direccion_residencia": order.cliente.direccion_residencia,
        "date": order.date,
        "direccion_entrega": order.direccion_entrega,
        "numero_impresiones": order.numero_impresiones
      }));
      setLoading(false);
      setData(parsedInfo);
    })
    .catch(e => setError(e));
  },[]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
  };

  const sendEmail = (pedido, correos) => {
    alert(`Se enviará la información del pedido ${pedido.id} a los siguientes correos: ${correos}`);
    if( correos ) {
      fetch("https://kmw9s686g7.execute-api.us-east-2.amazonaws.com/prod/enviar-pedido", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            ...pedido,
            to_emails: toEmails,
            nombre: pedido.nombre_cliente
          })
        })
        .then(r => {
          alert("El correo electrónico se ha enviado exitosamente");

          fetch("http://34.67.227.147:7000/pedido/incrementarimpresion", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
              id: pedido.id
            })
          }).then(d => {
            alert("Contador incrementado en 1");
            window.location.reload(); 
          })
          .catch((e) => console.error(e));
        })
      .catch(e => console.error(e));
    }
  };

  const createRow = useCallback((row) => {
    return (<TableRow hover={true} role="checkbox" tabIndex={-1} key={row.code}>
      {columns.map((column) => {
        const value = row[column.id];

        if(column.id === "actions") {
          return (
            <TableCell key={column.id}>
              <Button variant="contained" onClick={() => sendEmail(row, toEmails)} disabled={!toEmails}>
                Enviar correo
              </Button>
            </TableCell>
          );
        }

        return (
          <TableCell key={column.id}>
            {column.format ? column.format(value) : value ?? "-"}
          </TableCell>
        );
      })}
    </TableRow>);
  }, [toEmails]);

  return (
    <Grid container style={{ paddingTop: 30, paddingLeft: 50, paddingRight: 50 }}>
      
      <Grid
  container
  direction="row"
  justifyContent="space-between"
  alignItems="center"
>
  <Grid item xs={4}>
    <h2>Envío de información de pedidos</h2>
  </Grid>
  <Grid item xs={8}>
  <TextField
        required
        style={{width: "100%"}}
        id="outlined-required"
        label="Correos electrónicos separados por coma"
        value={toEmails}
        onChange={(e) => setToEmails(e.target.value)}
      />
  </Grid>
</Grid>
      <Paper style={{
        width: "100%",
      }}>
        <div style={{ height: "5px" }}>
          {loading ? <LinearProgress /> : <></>}
        </div>
        <TableContainer style={{
          height: "500px",
        }}>
          <Table stickyHeader aria-label="sticky table" style={{ width: "100%" }}>
            <colgroup>
              {columns.map((column, i) => (
                <col
                  key={"colWidth_" + i}
                  width={column.width ? column.width : 400}
                />
              ))}
            </colgroup>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {error ? (
                <TableRow hover={true} role="checkbox" tabIndex={-1}>
                  <TableCell colSpan={5}>
                    <p>{error}</p>
                  </TableCell>
                </TableRow>
              ) : !data.length && !loading ? (
                <TableRow hover={true} role="checkbox" tabIndex={-1}>
                  <TableCell colSpan={5}>
                    <p>No se encontraron resultados</p>
                  </TableCell>
                </TableRow>
              ) : (
                <></>
              )}
              {/* Build body rows */}
              {data
                .slice(page * size, page * size + size)
                .map((row) => createRow(row))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[]}
          component={"div"}
          count={data ? data.length : 0}
          rowsPerPage={size}
          labelRowsPerPage={"Pedidos por página"}
          backIconButtonText={"Anterior"}
          nextIconButtonText={"Siguiente"}
          page={page}
          onPageChange={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count, page }) =>
            `Página ${page + 1}: ${from} a ${to} de ${count !== -1 ? count : 0
            } registros`
          }
        />
      </Paper>
  </Grid>
  );
}

export default App;
