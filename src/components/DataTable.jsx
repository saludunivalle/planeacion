import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Typography } from '@mui/material';

const DataTable = ({ data, type, onEdit }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{type.charAt(0).toUpperCase() + type.slice(1)}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id}>
              <TableCell>
                <TextField
                  id={`${type}-${item.id}`}
                  defaultValue={item.nombre}
                  style={{ display: 'none' }}
                  variant="outlined"
                  size="small"
                />
                <Typography component="span" id={`${type}-display-${item.id}`}>{item.nombre}</Typography>
                <span className="edit-buttons">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onEdit(type, item.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => onEdit(type, item.id, true)}
                  >
                    Guardar
                  </Button>
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
