import styles from './auth-page.module.scss';
import {ControlButton} from "../control-button/control-button";
import {logIn} from "../../store/arkanoid-state";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {ModalWindow} from "../modal-window/modal-window";
import {useTranslation} from "react-i18next";

export const AuthPage = () => {

    const dispatch = useAppDispatch()

    const navigate = useNavigate();

    const {t} = useTranslation(['buttons', 'placeholders'])

    const {isLoggedIn, isLoggedInAsGuest} = useAppSelector(state => state.arkanoidState);

    const [signUpModalOpen, setSignUpModalOpen] = useState(false);

    useEffect(() => {
        (isLoggedIn || isLoggedInAsGuest) && navigate('/menu');
    }, [isLoggedIn, isLoggedInAsGuest, navigate]);

    const submitLogin = (isGuestLogIn: boolean) => {
        if (isGuestLogIn) {
            const username = `Player${Math.floor(Math.random() * 9) + 1}`;
            dispatch(logIn({username, isGuestLogIn}));
        } else {
            const loginForm = document.getElementById('login-form') as HTMLFormElement;
            const username = document.getElementById('username') as HTMLInputElement;
            const loginFormIsValid = loginForm.checkValidity();
            if (loginFormIsValid) {
                // some real login logic here
                dispatch(logIn({username: username.value, isGuestLogIn}));
            } else {
                loginForm.reportValidity();
            }
        }
    }

    const submitSignup = () => {
        const signupForm = document.getElementById('signup-form') as HTMLFormElement;
        const signupFormIsValid = signupForm.checkValidity();
        if (signupFormIsValid) {
            // some real signup logic here
            setSignUpModalOpen(false);
        } else {
            signupForm.reportValidity();
        }
    }

    return (
        <div className={styles['auth-page']}>
            <div className={styles['auth-page__form']}>
                <form id={'login-form'}>
                    <input
                        className={styles['auth-page__form-input']}
                        type={'text'}
                        placeholder={t('loginEmail', {ns: 'placeholders'})}
                        autoComplete={'username'}
                        id={'username'}
                        required={true}/>
                    <input
                        className={styles['auth-page__form-input']}
                        type={'password'}
                        placeholder={t('password', {ns: 'placeholders'})}
                        autoComplete={'current-password'}
                        required={true}/>
                </form>
                <div className={styles['auth-page__form__controls']}>
                    <ControlButton action={() => submitLogin(false)} text={t('login')}/>
                    <ControlButton action={() => submitLogin(true)} text={t('guest')}/>
                    <ControlButton action={() => setSignUpModalOpen(true)} text={t('signup')}/>
                </div>
            </div>
            <ModalWindow open={signUpModalOpen}>
                <div className={styles['auth-page__form']}>
                    <div className={styles['auth-page__form__close-icon']}
                         onClick={() => setSignUpModalOpen(false)}/>
                    <form id={'signup-form'}>
                        <input
                            className={styles['auth-page__form-input']}
                            type={'text'}
                            placeholder={t('name', {ns: 'placeholders'})}
                            autoComplete={'off'}
                            required={true}/>
                        <input
                            className={styles['auth-page__form-input']}
                            type={'text'}
                            placeholder={t('login', {ns: 'placeholders'})}
                            autoComplete={'username'}
                            required={true}/>
                        <input
                            className={styles['auth-page__form-input']}
                            type={'email'}
                            placeholder={t('email', {ns: 'placeholders'})}
                            autoComplete={'email'}
                            required={true}/>
                        <input
                            className={styles['auth-page__form-input']}
                            type={'password'}
                            placeholder={t('password', {ns: 'placeholders'})}
                            autoComplete={'new-password'}
                            required={true}/>
                        <input
                            className={styles['auth-page__form-input']}
                            type={'password'}
                            placeholder={t('repeatPassword', {ns: 'placeholders'})}
                            autoComplete={'new-password'}
                            required={true}/>
                    </form>
                    <ControlButton action={() => submitSignup()} text={t('signup')}/>
                </div>
            </ModalWindow>
        </div>
    )
}
