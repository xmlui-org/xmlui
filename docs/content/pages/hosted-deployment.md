# Hosted deployment

You can copy the structure shown in [App Structure](/app-structure) to any webserver configured to serve `index.html` and its subfolders.

Here are some common alternatives.

## Use an AWS Bucket

Your app can run from an AWS bucket. Here's the minimal app served that way: [http://xmlui-minimal.s3-website-us-east-1.amazonaws.com/](http://xmlui-minimal.s3-website-us-east-1.amazonaws.com/).

> [!INFO] **AWS recipe**
> - Upload xmlui-minimal folder to an AWS bucket
> - In Permissions, turn off the 'Block public access' setting
> - In Permissions, allow 'PublicRead'
> ```json
> {
>   "Version": "2012-10-17",
>   "Statement": [
>     {
>       "Sid": "PublicRead",
>       "Effect": "Allow",
>       "Principal": "*",
>       "Action": "s3:GetObject",
>       "Resource": "arn:aws:s3:::xmlui-minimal/*"
>     }
>   ]
> }
> ```
> - In Properties, turn on 'Static website hosting' and set 'index.html' as the default

## Use Netlify

You can just drag-and-drop the folder to Netlify: [https://xmlui-minimal.netlify.app/](https://xmlui-minimal.netlify.app/).

> [!INFO] **Netlify recipe**
> - Go to <a href="https://app.netlify.com/drop">https://app.netlify.com/drop</a>
> - Drag the xmlui-minimal folder to the drop target
> - Rename the appIn Permissions, allow 'PublicRead'
