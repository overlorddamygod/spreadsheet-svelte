import type {Cell} from '../types';

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

export {defaultCell};
