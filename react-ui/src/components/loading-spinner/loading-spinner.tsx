import styles from './loading-spinner.module.scss';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingSpinnerProps {
    isLoading: boolean
}

export const LoadingSpinner = ({isLoading}: LoadingSpinnerProps) => {
    return isLoading
        ?
        <div className={styles['loading-spinner']}>
            <CircularProgress color={'inherit'}/>
        </div>
        :
        <></>
};
