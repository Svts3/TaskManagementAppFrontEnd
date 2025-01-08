import { useState, useTransition } from "react"
import axios from "axios";
import styles from "../styles.module.css"
export default function SignIn(){

    const [pending, setTransition] = useTransition();
    const[error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    const [SignInIsSuccessful, setSignInIsSuccessful] = useState();

    const handleFormSubmit = async(formData) => {
        setTransition(async()=>{
            setError(false);
            try{
                const requestData = {
                    email: formData.get('email'),
                    password: formData.get('password')
                }
                console.log(requestData)
                const response = await axios.post(`http://localhost:8080/auth/login`, requestData);

                if(response.status===200){
                    setSignInIsSuccessful(true)
                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
            }catch(e){
                setSignInIsSuccessful(false)
                setError(true);
                if(e.response){
                    console.log(e.response)
                }else{

                    setErrorMessage('Something went wrong. Message: ', e.message);
                }
            }
            


        })
    }
    
    return(
        <div className={styles['sign-in']}>
            <form action={handleFormSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" />
                <label htmlFor="password"></label>
                <input type="password" id="password" name="password" />
                <button type="submit" disabled={pending}>Sign in</button>
                {error && <p className={styles.error}>{errorMessage}</p>}
                {SignInIsSuccessful && <span className={styles.success}>Success</span>}
            </form>
            
        </div>
    )
}