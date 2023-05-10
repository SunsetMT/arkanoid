import styles from './fullscreen-button.module.scss';
import {FullScreenHandle} from "react-full-screen";
import {useMediaQuery, useTheme} from "@mui/material";

interface FullscreenButtonProps {
    fullScreenHandle: FullScreenHandle
}

export const FullscreenButton = ({fullScreenHandle}: FullscreenButtonProps) => {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        isMobile ?
            <button
                className={`${styles['fullscreen-button']} ${fullScreenHandle.active && styles['fullscreen-button-compress']}`}
                onClick={fullScreenHandle.active ? fullScreenHandle.exit : fullScreenHandle.enter}/>
            :
            <></>
    )
}

