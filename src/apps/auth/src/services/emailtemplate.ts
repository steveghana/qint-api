export const EmailTemplate = (country: string, name: string) => {
  if (country === 'IL') {
    return `
      <p>היי ${name},</p>
  
      <p>תודה שהצטרפת ל-Q-int 🙂</p>
  
      <p>אני יוחאי, המייסד של Q-int, ואני רוצה להודות לך באופן אישי שנרשמת לשירות שלנו ונרגש להתחיל לעבוד יחד.</p>
  
      <p>הקמנו את Q-int כדי לשפר את חווית הלקוח ולפשט את תהליך ניהול התורים, כתוצאה מכך שביעות רצון הלקוחות גבוהה יותר מובילה להגדלת ההכנסות.</p>
  
      <p>אני תמיד שמח לקרוא את ההצעות של הלקוחות שלנו, תרגיש חופשי לפנות אלי בכל אחד מערוצי התקשורת.</p>
  
      <p>נשמח לתת לך חודש מתנה לשימוש במערכת שלנו ללא עלות על מנת שנוכל להפיק את הערך כבר מהיום הראשון ללא התחייבות מצידך. (תקף עד 7 ימים מרגע קבלת המייל)</p>
  
      <p>כדי לממש את החודש תלחץ על הלינק הבא שיוביל לוואטסאפ האישי שלי ונפתח לך גישה למערכת 🙂</p>
      <p><a href="https://katzr.net/247f33">https://katzr.net/247f33</a></p>
  
      <p>תודה!</p>
  
      <p>יחאי סיטבון - +972508854434<br>
      sitbonyohai@gmila.com</p>
  `;
  }
  return `
    <p>Hi ${name}!</p>

    <p>Thanks for joining Q-int 🙂</p>

    <p>My name is Yohai, and I'm the founder of Q-int. I wanted to personally thank you for signing up for our service.</p>

    <p>Our goal at Q-int was to improve the customer experience and simplify queue management, which would result in higher revenue.</p>

    <p>Feel free to contact me through any of the communication channels. I'm always happy to hear suggestions from our customers.</p>

    <p>You can have a free month to use our system so that we can get a taste of its value right away, without committing. (Valid up to 7 days after receiving this email)</p>

    <p>You can redeem the free month by clicking on the following link, which will lead you to my personal WhatsApp account: 🙂</p>
    <p><a href="https://katzr.net/247f33">https://katzr.net/247f33</a></p>

    <p>Thank you!</p>

    <p>972508854434 - Yohai Sitbon<br>
    sitbonyohai@gmila.com</p>
`;
};
