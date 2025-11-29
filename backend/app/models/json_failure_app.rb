class JsonFailureApp < Devise::FailureApp
  def respond
    # if the request is API/JSON return JSON error
    # Otherwise, do the default (redirect)
    if request.format == :json || request.headers['Accept']&.include?('application/json')
      json_failure
    else
      super
    end
  end

  def json_failure
    self.status = 401
    self.content_type = 'application/json'
    self.response_body = { error: i18n_message }.to_json
  end
end