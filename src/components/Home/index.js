import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'

import {AiOutlineClose, AiOutlineSearch} from 'react-icons/ai'

import Header from '../Header'
import NavigationBar from '../NavigationBar'
import ThemeAndVideoContext from '../../context/ThemeAndVideoContext'
import VideoCard from '../VideoCard'
import FailureView from '../FailureView'

import {
  HomeContainer,
  BannerContainer,
  BannerImage,
  BannerText,
  BannerButton,
  BannerLeftPart,
  BannerRightPart,
  BannerCloseButton,
  SearchContainer,
  SearchInput,
  SearchIconContainer,
  LoaderContainer,
  HomeVideosList,
  NoVideosView,
  NoVideosImage,
  NoVideosHeading,
  NoVideosNote,
  RetryButton,
} from './styledComponents'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Home extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    homeVideos: [],
    searchInput: '',
    bannerDisplay: true,
  }

  componentDidMount() {
    this.getHomeVideos()
  }

  getHomeVideos = async () => {
    const {searchInput} = this.state
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/videos/all?search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const updatedData = data.videos.map(eachVideo => ({
        id: eachVideo.id,
        title: eachVideo.title,
        thumbnailUrl: eachVideo.thumbnail_url,
        viewCount: eachVideo.view_count,
        publishedAt: eachVideo.published_at,
        name: eachVideo.channel.name,
        profileImageUrl: eachVideo.channel.profile_image_url,
      }))
      this.setState({
        homeVideos: updatedData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  onCloseBanner = () => {
    this.setState(prevState => ({bannerDisplay: !prevState.bannerDisplay}))
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  getSearchResults = () => {
    this.getHomeVideos()
  }

  onRetry = () => {
    this.setState({searchInput: ''}, this.getHomeVideos)
  }

  renderLoadingView = () => (
    <LoaderContainer data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </LoaderContainer>
  )

  renderSuccessView = () => {
    const {homeVideos} = this.state
    const videosCount = homeVideos.length
    const onClickRetry = () => {
      this.onRetry()
    }

    return (
      <ThemeAndVideoContext.Consumer>
        {value => {
          const {isDarkTheme} = value
          const headingColor = isDarkTheme ? '#f1f5f9' : '#1e293b'
          const noteColor = isDarkTheme ? '#e2e8e0' : '#475569'

          return videosCount > 0 ? (
            <HomeVideosList>
              {homeVideos.map(eachVideo => (
                <VideoCard key={eachVideo.id} videoDetails={eachVideo} />
              ))}
            </HomeVideosList>
          ) : (
            <NoVideosView>
              <NoVideosImage
                src="https://assets.ccbp.in/frontend/react-js/nxt-watch-no-search-results-img.png"
                alt="no videos"
              />
              <NoVideosHeading headingColor={headingColor}>
                No Search results found
              </NoVideosHeading>
              <NoVideosNote noteColor={noteColor}>
                Try different key words or remove search filter
              </NoVideosNote>
              <RetryButton type="button" onClick={onClickRetry}>
                Retry
              </RetryButton>
            </NoVideosView>
          )
        }}
      </ThemeAndVideoContext.Consumer>
    )
  }

  renderFailureView = () => <FailureView onRetry={this.onRetry} />

  renderHomeVideos = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderSuccessView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    const {searchInput, bannerDisplay} = this.state

    return (
      <ThemeAndVideoContext.Consumer>
        {value => {
          const {isDarkTheme} = value

          const bgColor = isDarkTheme ? '#181818' : '#f9f9f9'
          const textColor = isDarkTheme ? '#f9f9f9' : '#231f20'

          return (
            <>
              <Header />
              <NavigationBar />
              <HomeContainer data-testid="home" bgColor={bgColor}>
                {bannerDisplay ? (
                  <BannerContainer data-testid="banner">
                    <BannerLeftPart>
                      <BannerImage
                        src="https://assets.ccbp.in/frontend/react-js/nxt-watch-logo-light-theme-img.png"
                        alt="nxt watch logo"
                      />
                      <BannerText>
                        Buy Nxt Watch Premium prepaid plans with <br /> UPI
                      </BannerText>
                      <BannerButton type="button">GET IT NOW</BannerButton>
                    </BannerLeftPart>
                    <BannerRightPart>
                      <BannerCloseButton
                        data-testid="close"
                        onClick={this.onCloseBanner}
                        type="button"
                      >
                        <AiOutlineClose size={25} />
                      </BannerCloseButton>
                    </BannerRightPart>
                  </BannerContainer>
                ) : null}
                <SearchContainer>
                  <SearchInput
                    type="search"
                    placeholder="Search"
                    value={searchInput}
                    onChange={this.onChangeSearchInput}
                    color={textColor}
                  />
                  <SearchIconContainer
                    data-testid="searchButton"
                    onClick={this.getSearchResults}
                    type="button"
                  >
                    <AiOutlineSearch size={20} />
                  </SearchIconContainer>
                </SearchContainer>
                {this.renderHomeVideos()}
              </HomeContainer>
            </>
          )
        }}
      </ThemeAndVideoContext.Consumer>
    )
  }
}

export default Home
