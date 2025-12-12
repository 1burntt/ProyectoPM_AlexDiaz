
export const errorMessageValidation = (error: unknown, title: string): void => {
    if(error){
        console.log(title, error ?? error);
    };
}