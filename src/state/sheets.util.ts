import type {Cell} from '../types';
import go from "../wasm"

const defaultCell: () => Cell = () => {
  return {
    value: '',
    formatting: {
      align: 'center',
      color: 'white',
      backgroundColor: '#242424'
    }
  };
};

const calculate = () => {

}

export {defaultCell};
