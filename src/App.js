import "style.scss";
import {
  ReplyIcon,
  RetweetIcon,
  LikeIcon,
  ShareIcon,
  VerifiedIcon,
} from "icons";
import { createRef, useEffect, useState } from "react";
import { AvatarLoader } from "loaders";
import { useScreenshot } from "use-react-screenshot";

function convertImgToBase64(url, callback, outputFormat) {
  var canvas = document.createElement("CANVAS");
  var ctx = canvas.getContext("2d");
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || "image/png");
    callback.call(this, dataURL);
    // Clean up
    canvas = null;
  };
  img.src = url;
}

const tweetFormat = (tweet) => {
  tweet = tweet
    .replace(/@([\w]+)/g, "<span>@$1</span>")
    .replace(/#([\wşçöğüıİ]+)/gi, "<span>#$1</span>")
    .replace(/(https?:\/\/[\w\.\?\=\&\/]+)/, "<span>$1</span>");
  return tweet;
};

const formatNumber = (number) => {
  if (!number) {
    number = 0;
  }
  if (number < 1000) {
    return number;
  }
  number /= 1000;
  number = String(number).split(".");
  return (
    number[0] + (number[1] > 100 ? "," + number[1].slice(0, 1) + " B" : " B")
  );
};

function App() {
  const ref = createRef(null);
  const downloadRef = createRef();

  const [name, setName] = useState();
  const [userName, setUserName] = useState();
  const [isVerified, setIsVerified] = useState(false);
  const [tweet, setTweet] = useState();
  const [avatar, setAvatar] = useState();
  const [retweets, setRetweets] = useState(0);
  const [quoteTweets, setQuoteTweets] = useState(0);
  const [likes, setLikes] = useState(0);

  const [image, takeScreenshot] = useScreenshot();
  const getImage = () => takeScreenshot(ref.current);

  useEffect(() => {
    if (image) {
      downloadRef.current.click();
    }
  }, [image]);

  const avatarHandle = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      setAvatar(this.result);
    });
    reader.readAsDataURL(file);
  };

  const fetchTwitterInfo = () => {
    fetch(
      `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${userName}`
    )
      .then((res) => res.json())
      .then((data) => {
        const twitter = data[0];
        console.log(data[0]);
        convertImgToBase64(
          twitter.profile_image_url_https,
          function (base64Image) {
            setAvatar(base64Image);
          }
        );

        setUserName(twitter.screen_name);
        setName(twitter.name);
        setTweet(twitter.status.text);
        setRetweets(twitter.status.retweet_count);
        setLikes(twitter.status.favorite_count);
      });
  };

  return (
    <>
      <div className="tweet-settings">
        <h3>Tweet Ayarları</h3>
        <ul>
          <li>
            <label>Ad Soyad</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </li>
          <li>
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              className="input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </li>
          <li>
            <label>Tweet</label>
            <textarea
              className="textarea"
              maxLength="290"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
            ></textarea>
          </li>
          <li>
            <label>Profil Resmi</label>
            <input type="file" className="input" onChange={avatarHandle} />
          </li>
          <li>
            <label>Retweet</label>
            <input
              type="number"
              className="input"
              value={retweets}
              onChange={(e) => setRetweets(e.target.value)}
            />
          </li>
          <li>
            <label>Alıntı Tweetler</label>
            <input
              type="number"
              className="input"
              value={quoteTweets}
              onChange={(e) => setQuoteTweets(e.target.value)}
            />
          </li>
          <li>
            <label>Beğeni</label>
            <input
              type="number"
              className="input"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
            />
          </li>
          <li>
            <label>Doğrulanmış Hesap</label>
            <select
              onChange={(e) => setIsVerified(e.target.value)}
              defaultValue={isVerified}
            >
              <option value="1">Evet</option>
              <option value="0" selected>
                Hayır
              </option>
            </select>
          </li>
          <button onClick={getImage}>Oluştur</button>
          {image && (
            <div className="download-url">
              <a ref={downloadRef} href={image} download="tweet.png">
                Tweet'i İndir
              </a>
            </div>
          )}
        </ul>
      </div>
      <div className="tweet-container">
        <div className="fetch-info">
          <input
            type="text"
            value={userName}
            placeholder="Twitter Kullanıcı Ara"
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={fetchTwitterInfo}>Bilgileri Çek</button>
        </div>
        <div className="tweet" ref={ref}>
          <div className="tweet-author">
            {(avatar && <img src={avatar} />) || <AvatarLoader />}
            <div>
              <div className="name">
                {name || "Ad Soyad"}
                {isVerified == 1 && <VerifiedIcon width="19" height="19" />}
              </div>
              <div className="username">@{userName || "kullanici_adi"}</div>
            </div>
          </div>
          <div className="tweet-content">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  (tweet && tweetFormat(tweet)) ||
                  "Bu Alana Örnek Tweet  Gelecek",
              }}
            />
          </div>
          <div className="tweet-stats">
            <span>
              <b>{formatNumber(retweets)}</b> Retweet
            </span>
            <span>
              <b>{formatNumber(quoteTweets)}</b> Alıntı Tweetler
            </span>
            <span>
              <b>{formatNumber(likes)}</b> Beğeni
            </span>
          </div>
          <div className="tweet-actions">
            <span>
              <ReplyIcon />
            </span>
            <span>
              <RetweetIcon />
            </span>
            <span>
              <LikeIcon />
            </span>
            <span>
              <ShareIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
