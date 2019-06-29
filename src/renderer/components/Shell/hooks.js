import { useSelector } from 'react-redux';


export const useRedux = () => useSelector(({ loading }) => loading);
