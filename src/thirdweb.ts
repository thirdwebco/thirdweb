import jwt_decode from 'jwt-decode';
import Postmate from 'postmate';

export interface ThirdwebConfig {
  connectUrl: string;
}

export interface AutoPay {
  authorizeAmount: number;
  currency: string;
}

export interface LoginRequest {
  provider: string;
}

export interface Position {
  left: number;
  top: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TokenPayload {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  autopay: AutoPay;
}

export const DefaultThirdwebConfig: ThirdwebConfig = { connectUrl: 'https://connect.thirdweb.co/' };

export function initialize(config = DefaultThirdwebConfig): Thirdweb {
  return new Thirdweb(config);
}

export class Thirdweb {

  private token: string | null = null;

  private autopay: AutoPay | null = null;

  private handshake: any;

  constructor(private config = DefaultThirdwebConfig) {
    this.processRedirectResult();
    this.embedThirdweb();
    this.loadToken();

    if (this.token) {
      this.handshake.then((child: any) => {
        child.call('setClaimToken', this.token);
      });
    }
  }

  processRedirectResult() {
    const match = window.location.hash.match(/#?&?thirdweb_token=([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)$/);
    if (match) {
      localStorage.setItem('thirdweb_token', match[1]);
      let url = window.location.href.substring(0, window.location.href.length - match[0].length);
      window.location.replace(url);
    }
  }

  embedThirdweb() {
    this.handshake = new Postmate({
      container: document.body,
      url: this.config.connectUrl,
      classListArray: ['thirdweb-frame'],
    });

    const frame = document.querySelector('.thirdweb-frame') as HTMLIFrameElement;
    frame.style.border = 'none';
    frame.style.backgroundColor = 'transparent';
    frame.style.position = 'fixed';
    frame.style.right = '0px';
    frame.style.top = '40px';
    frame.style.overflow = 'none';

    this.handshake.then((child: any) => {
      child.on('size-changed', (size: Size) => {
        child.frame.style.width = `${size.width}px`;
        child.frame.style.height = `${size.height}px`;
      });

      child.on('position-changed', (position: Position)  => {
        child.frame.style.top = `${position.top}px`;
      });

      child.on('login', this.loginRequest.bind(this));

      child.on('logout', this.logoutRequest.bind(this));
    });
  }

  loginRequest(data: LoginRequest) {
    if (['facebook', 'google'].includes(data.provider)) {
      window.location.replace(`${this.config.connectUrl}auth.html#auth_type=${data.provider}&redirect_uri=${window.location.href}`);
    }
  }

  logoutRequest() {
    localStorage.removeItem('thirdweb_token');
    window.location.replace(`${this.config.connectUrl}auth.html#auth_type=logout&redirect_uri=${window.location.href}`);
  }

  loadToken() {
    const token = localStorage.getItem('thirdweb_token');
    if (!token) {
      return null;
    }

    const payload: TokenPayload = jwt_decode(token);
    if (!this.validateToken(payload)) {
      localStorage.removeItem('thirdweb_token');
    }

    this.token = token;
    this.autopay = payload.autopay;
  }

  validateToken(payload: TokenPayload) {
    if (payload.iss !== 'https://connect.thirdweb.co') {
      return false;
    }

    // Taken from RFC 3986: https://tools.ietf.org/html/rfc3986#appendix-B
    const match = window.location.href.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
    const authority = match && match[4];
    if (payload.aud !== authority) {
      return false;
    }

    if (payload.iat >= Date.now() / 1000) {
      return false;
    }

    if (payload.exp <= Date.now() / 1000) {
      return false;
    }

    return true;
  }
}